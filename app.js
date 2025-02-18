const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

let products = [];

fs.readFile('product.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading products file');
        process.exit(1);
    }
    products = JSON.parse(data);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log('Request received');
    const timestamp = new Date().toISOString();
    const logMessage = `Request received for path: ${req.url} and from IP: ${req.ip}\nTime: ${timestamp}\n\n`;

    fs.appendFile('visits.log', logMessage, (err) => {
        if (err) {
            console.log('Error in logging');
        }
    });

    next();
});

app.get('/logs', (req, res) => {
    fs.readFile('visits.log', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading log file');
        }
        const logs = data.split('\n').filter(line => line).map(line => {
            const [path, ip, time] = line.split('\n');
            return { path, ip, time };
        });
        res.json(logs);
    });
});

app.get('/products', (req, res) => {
    const category = req.query.category;
    if (category) {
        const filteredProducts = products.filter(product => product.category === category);
        res.json(filteredProducts);
    } else {
        res.json(products);
    }
});

app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product); 
    } else {
        res.status(404).send('Product not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
