const { validationResult } = require("express-validator");
const VaccinationCentre = require("../models/vaccination-centre");
const VaccinationStock = require("../models/vaccine-stock");

// Register vaccination centre
exports.registerVaccinationCentre = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const { email, phone } = req.body;
        const emailExists = await VaccinationCentre.findOne({ email }, 'email -_id').exec();
        const phoneExists = await VaccinationCentre.findOne({ phone }, 'phone -_id').exec();

        if (emailExists) {
            return res.status(400).json({ error: "Email is already registered" });
        }
        if (phoneExists) {
            return res.status(400).json({ error: "Phone number is already registered" });
        }

        // First, creating a default object of the stock data
        // to get the ObjectId and store it in the vaccination centre schema
        const vaccinationStock = new VaccinationStock();
        const vaccineStockData = await vaccinationStock.save();

        // The execution terminates if it fails to store default data in vaccination stock
        if (!vaccineStockData) {
            return res.send(400).json({ error: "Vaccination centre registration failed" })
        }

        // Storing the ObjectId along with other data inside req.body
        // into the registrationData
        let registrationData = req.body;
        registrationData.vaccines = vaccineStockData._id;

        // Storing the registrationData into the vaccination centre database
        const vaccinationCentre = new VaccinationCentre(registrationData);
        const vaccinationCentreData = await vaccinationCentre.save();

        if (!vaccinationCentreData) {
            return res.send(400).json({ error: "Vaccination centre registration failed" })
        }

        return res.status(200).json({
            _id: vaccinationCentreData._id,
            centre_name: vaccinationCentreData.centre_name,
            email: vaccinationCentreData.email,
            phone: vaccinationCentreData.phone,
            address: vaccinationCentreData.address,
            pin_code: vaccinationCentreData.pin_code,
            district: vaccinationCentreData.district,
            state: vaccinationCentreData.state,
        });
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}

exports.loginToVaccinationCentre = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const { email, password } = req.body;
        const vaccinationCentre = await VaccinationCentre.findOne({ email })
            .populate('vaccines', '-_id -createdAt -updatedAt -__v');

        if (!vaccinationCentre) {
            return res.status(400).json({ error: "Vaccination centre does not exists" });
        }

        if (vaccinationCentre.authenticate(password)) {
            const { _id, centre_name, email, phone, address, pin_code, district, state } = vaccinationCentre;
            const { vaccine, stock, paid } = vaccinationCentre.vaccines;
            let vaccineData = [];
            vaccine.map((item, index) => {
                vaccineData.push({
                    name: item,
                    stock: stock[index],
                    paid: paid[index]
                });
            });

            return res.status(200).json({
                _id: _id,
                centre_name: centre_name,
                email, email,
                phone: phone,
                address, address,
                pin_code: pin_code,
                district: district,
                state: state,
                vaccines: vaccineData,
            });
        } else {
            return res.status(400).json({ error: "Password is incorrect" });
        }
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}



// Fetch all vaccination centres using PIN code
exports.searchVaccinationCentresUsingPIN = async (req, res) => {
    try {
        const pinCode = req.params.pincode;

        const vaccinationCentresData = await VaccinationCentre.find({ pin_code: parseInt(pinCode) },
            "_id centre_name email phone paid"
        ).populate("vaccines", "-_id -createdAt -updatedAt -__v");

        if (vaccinationCentresData) {

            let vaccinationCentreList = [];
            vaccinationCentresData.map((item, index) => {
                let vaccineData = [];
                const { _id, centre_name, email, phone } = item;
                const { vaccine, stock, paid } = item.vaccines;

                vaccine.map((item, index) => {
                    vaccineData.push({
                        name: item,
                        stock: stock[index],
                        paid: paid[index]
                    });
                });

                vaccinationCentreList.push({
                    _id: _id,
                    centre_name: centre_name,
                    email: email,
                    phone: phone,
                    vaccines: vaccineData
                });
            });

            return res.status(200).json(vaccinationCentreList);
        }

        return res.status(400).json({ error: "No data found" });
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}

// Fetch all vaccination centres using district
exports.searchVaccinationCentresUsingDistrict = async (req, res) => {
    try {
        const district = req.params.district;

        const vaccinationCentres = await VaccinationCentre.find({ district: district },
            "_id centre_name email phone paid"
        ).populate("vaccines", "-_id -createdAt -updatedAt -__v");

        if (vaccinationCentres) {

            let vaccinationCentreList = [];

            vaccinationCentres.map((item, index) => {
                let vaccineData = [];
                const { _id, centre_name, email, phone } = item;
                const { vaccine, stock, paid } = item.vaccines;

                vaccine.map((item, index) => {
                    vaccineData.push({
                        name: item,
                        stock: stock[index],
                        paid: paid[index]
                    });
                });

                vaccinationCentreList.push({
                    _id: _id,
                    centre_name: centre_name,
                    email: email,
                    phone: phone,
                    vaccines: vaccineData
                });
            });
            return res.status(200).json(vaccinationCentreList);
        }

        return res.status(400).json({ error: "No data found" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
}

// Fetch vaccination centre details
exports.getVaccinationCentreDetails = async (req, res) => {
    try {
        const vaccinationCentreId = req.params.vaccinationcentreid;

        let vaccinationCentreDetails = await VaccinationCentre.findById(vaccinationCentreId,
            '-password -createdAt -updatedAt -__v'
        ).populate("vaccines", "-_id -createdAt -updatedAt -__v");

        if (vaccinationCentreDetails) {
            const { _id, centre_name, email, phone, address, pin_code, district, state, available_slots } = vaccinationCentreDetails;
            const { vaccine, stock, paid } = vaccinationCentreDetails.vaccines;

            let vaccineData = [];

            vaccine.map((item, index) => {
                vaccineData.push({
                    name: item,
                    stock: stock[index],
                    paid: paid[index]
                });
            });

            return res.status(200).json({
                _id: _id,
                centre_name: centre_name,
                email: email,
                phone: phone,
                address: address,
                pin_code: pin_code,
                district: district,
                state: state,
                vaccines: vaccineData,
                available_slots: available_slots
            });
        }
        res.status(400).json({ error: "Vaccination centre does not exists" });
    } catch (error) {
        res.status(400).json({ error: error });
    }
}

exports.addVaccine = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const vaccinationCentreId = req.params.vaccinationcentreid;
        const vaccineStockId = await VaccinationCentre.findById(vaccinationCentreId, '-_id vaccines').exec();

        // Terminate the execution if tempData does not exists
        if (!vaccineStockId) {
            return res.status(400).json({ error: "Vaccination centre does not exists" });
        }

        // Fetching the existing vaccine stock corrosponding to the vaccination centre
        let existingVaccineData = await VaccinationStock.findById({ _id: vaccineStockId.vaccines._id });
        let vaccine = existingVaccineData.vaccine;
        let stock = existingVaccineData.stock;
        let isPaid = existingVaccineData.paid;

        // Destructuring req.body
        let { name, count, paid } = req.body;
        name = name.toLowerCase();

        // If the vaccine with the same name exists in database,
        //    We'll be fetching the index of the vaccine from the vaccine array
        //    We'll only be pushing the data into the array under two conditions -
        //       1. When index1 = index2 and existing vaccine's paid is not equal to new vaccine's paid
        //       2. When existing vaccines's paid is not equal to new vaccine's paid
        // Otherwise, we'll be pushing new vaccines data into the array in the else block
        if (vaccine.includes(name)) {
            const index1 = vaccine.indexOf(name);
            const index2 = vaccine.lastIndexOf(name);
            if ((index1 == index2) && isPaid[index1] != paid) {
                vaccine.push(name);
                stock.push(count);
                isPaid.push(paid);
            } else if (!(isPaid[index1] == paid || isPaid[index2] == paid)) {
                vaccine.push(name);
                stock.push(count);
                isPaid.push(paid);
            } else {
                return res.status(400).json({ error: `${paid ? "paid" : "free"} version of ${name} exists in database` });
            }
        } else {
            vaccine.push(name);
            stock.push(count);
            isPaid.push(paid);
        }

        // Updating the vaccine and stock arrays
        existingVaccineData.vaccine = vaccine;
        existingVaccineData.stock = stock;
        existingVaccineData.paid = isPaid;

        // Saving the updated data into the Database
        const updatedVaccineData = await existingVaccineData.save();
        const updatedVaccine = updatedVaccineData.vaccine;
        const updatedStock = updatedVaccineData.stock;
        const updatedIsPaid = updatedVaccineData.paid;

        // Mapping vaccine, stock and paid array into updatedVaccineArray
        let updatedVaccineArray = [];
        updatedVaccine.map((item, index) => {
            updatedVaccineArray.push({
                name: item,
                stock: updatedStock[index],
                paid: updatedIsPaid[index]
            })
        });

        return res.status(200).json(updatedVaccineArray);
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}

//  Update vaccination centre stock
exports.updateStock = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
                params: errors.array()[0].param,
            });
        }

        const vaccinationCentreId = req.params.vaccinationcentreid;
        const vaccineStockId = await VaccinationCentre.findById(vaccinationCentreId, '-_id vaccines').exec();

        // Terminate the execution if vaccineStockId does not exists
        if (!vaccineStockId) {
            return res.status(400).json({ error: "Vaccination centre does not exists" });
        }

        // Fetching the existing vaccine stock corrosponding to the vaccination centre
        let existingVaccineData = await VaccinationStock.findById({ _id: vaccineStockId.vaccines._id });
        const vaccine = existingVaccineData.vaccine;
        let stock = existingVaccineData.stock;
        const isPaid = existingVaccineData.paid;

        // Destructuring req.body
        let { name, count, paid } = req.body;
        name = name.toLowerCase();

        // Checking if the vaccine does not exists in database
        if (!vaccine.includes(name)) {
            return res.status(400).json({ error: `${name} does not exists in database` });
        }

        // Finding the index of the vaccine in the array
        // to update the corrosponding count 
        const index1 = vaccine.indexOf(name);
        const index2 = vaccine.lastIndexOf(name);

        if (index1 == index2 && isPaid[index1] == paid) {
            console.log("SAME INDEX GETTING EXECUTED");
            stock[index1] += count;
        } else if (isPaid[index1] == paid) {
            stock[index1] += count;
        } else if (isPaid[index2] == paid) {
            stock[index2] += count;

        } else {
            return res.status(400).json({ error: `${paid ? "paid" : "free"} version of ${name} does not exists in database` });
        }

        existingVaccineData.stock = stock;

        // Saving the updated data into the Database
        const updatedVaccineData = await existingVaccineData.save();
        const updatedVaccine = updatedVaccineData.vaccine;
        const updatedStock = updatedVaccineData.stock;
        const updatedIsPaid = updatedVaccineData.paid;

        // Mapping vaccine, stock and paid array into updatedVaccineArray
        let updatedVaccineArray = [];
        updatedVaccine.map((item, index) => {
            updatedVaccineArray.push({
                name: item,
                stock: updatedStock[index],
                paid: updatedIsPaid[index]
            })
        });

        return res.status(200).json(updatedVaccineArray);
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}
