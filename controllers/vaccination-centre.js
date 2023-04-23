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
            paid: vaccinationCentreData.paid,
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

        if (vaccinationCentre != null) {
            const { password: userPassword } = vaccinationCentre;
            if (userPassword === password) {
                const { _id, centre_name, email, phone, address, pin_code, district, state, vaccines, paid } = vaccinationCentre;
                const { vaccine, stock } = vaccinationCentre.vaccines;
                let vaccineData = {};
                vaccine.map((item, index) => vaccineData[item] = stock[index]);

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
                    paid: paid
                });
            } else {
                return res.status(400).json({ error: "Password is incorrect" });
            }
        } else {
            return res.status(400).json({ error: "Vaccination centre does not exist" });
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
                let vaccineData = {};
                const { _id, centre_name, email, phone, paid } = item;
                const { vaccine, stock } = item.vaccines;

                vaccine.map((item, index) => vaccineData[item] = stock[index]);

                console.log(vaccineData);

                vaccinationCentreList.push({
                    _id: _id,
                    centre_name: centre_name,
                    email: email,
                    phone: phone,
                    vaccines: vaccineData,
                    paid, paid
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
                let vaccineData = {};
                const { _id, centre_name, email, phone, paid } = item;
                const { vaccine, stock } = item.vaccines;

                vaccine.map((item, index) => vaccineData[item] = stock[index]);

                vaccinationCentreList.push({
                    _id: _id,
                    centre_name: centre_name,
                    email: email,
                    phone: phone,
                    vaccines: vaccineData,
                    paid, paid
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
            const { vaccine, stock } = vaccinationCentreDetails.vaccines;

            let vaccineData = {};

            vaccine.map((item, index) => vaccineData[item] = stock[index]);

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

        // Destructuring req.body
        let { name, count } = req.body;
        name = name.toLowerCase();
        count = parseInt(count);

        // Checking if the vaccine exists in database
        if (vaccine.includes(name)) {
            return res.status(400).json({ error: `${name} exists in database` });
        }

        // Adding new data to vaccine and stock array
        vaccine.push(name);
        stock.push(count);

        // Updating the vaccine and stock arrays
        existingVaccineData.vaccine = vaccine;
        existingVaccineData.stock = stock;

        // Saving the updated data into the Database
        const updatedVaccineData = await existingVaccineData.save();
        const updatedVaccine = updatedVaccineData.vaccine;
        const updatedStock = updatedVaccineData.stock;

        // Mapping vaccine and stock array into updatedVaccineObject
        let updatedVaccineObject = {};
        updatedVaccine.map((item, index) => {
            updatedVaccineObject[item] = updatedStock[index];
        });

        return res.status(200).json(updatedVaccineObject);
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
        let vaccine = existingVaccineData.vaccine;
        let stock = existingVaccineData.stock;

        // Destructuring req.body
        let { name, count } = req.body;
        name = name.toLowerCase();
        count = parseInt(count);

        // Checking if the vaccine does not exists in database
        if (!vaccine.includes(name)) {
            return res.status(400).json({ error: `${name} does not exists in database` });
        }

        // Finding the index of the vaccine in the array
        // to update the corrosponding count 
        const index = vaccine.indexOf(name);
        stock[index] += count;
        existingVaccineData.stock = stock;

        // Saving the updated data into the Database
        const updatedVaccineData = await existingVaccineData.save();
        const updatedVaccine = updatedVaccineData.vaccine;
        const updatedStock = updatedVaccineData.stock;

        // Mapping vaccine and stock array into updatedVaccineObject
        let updatedVaccineObject = {};
        updatedVaccine.map((item, index) => {
            updatedVaccineObject[item] = updatedStock[index];
        });

        return res.status(200).json(updatedVaccineObject);
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}
