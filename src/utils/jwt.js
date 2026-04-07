const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id_user_n,
            email: user.email,
            name: user.name,
            DOB: user.DOB,
            cell_phone: user.cell_phone,
            mail_address: user.mail_address,
            img_profile: user.img_profile,
        },
        'secret_key',
        { expiresIn: '2h' }
    );
};

module.exports = { generateToken };