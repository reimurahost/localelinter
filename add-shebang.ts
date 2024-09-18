const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dist', 'index.js');
const shebang = `#!/usr/bin/env node

/*
 * Copyright (c) 2024 JewelEyed
 * MIT License
 */
`;

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading file: ${err}`);
        return;
    }

    const updatedData = shebang + data;

    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file: ${err}`);
        } else {
            console.log('Shebang added successfully!');
        }
    });
});
