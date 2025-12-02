const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const sessionRoutes = require('./routes/sessionRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const path = require('path');

const authRoutes = require('./routes/authRoutes'); 

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes); 
app.use('/api/sessions', sessionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => {
    res.json({ message: 'Serverul functioneaza!' });
});

sequelize.sync({ alter: true }).then(() => {
    console.log('Baza de date sincronizata.');
    app.listen(PORT, () => {
        console.log(`Serverul ruleaza pe portul ${PORT}`);
    });
}).catch(err => console.log(err));