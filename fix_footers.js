const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/features/**/*.html');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<app-export-buttons')) {
        const regex = /\[data\]="([a-zA-Z0-9_$]+)\."/g;
        if (regex.test(content)) {
            content = content.replace(regex, '[data]="$1"');
            fs.writeFileSync(file, content);
            count++;
            console.log('Fixed', file);
        }
    }
});
console.log('Fixed count:', count);
