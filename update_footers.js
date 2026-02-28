const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/features/**/*.html');
console.log(`Found ${files.length} HTML files to process.`);
let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Look for records-info span inside table-footer
    // Example: <span class="records-info">Showing {{ transactions.length }} records</span>
    // We want to extract the variable name (e.g., 'transactions').
    const regex = /<span class="records-info">Showing \{\{\s*([a-zA-Z0-9_$.?]+)[\.]?length\s*\}\}.*?<\/span>/;
    const match = content.match(regex);

    if (match) {
        const varName = match[1];

        if (!content.includes('<app-export-buttons')) {
            const exportTag = `\n        <app-export-buttons [data]="${varName}"></app-export-buttons>`;
            // Check if it's already inside a flex layout, otherwise insert right after the span
            content = content.replace(regex, `${match[0]}${exportTag}`);

            // Update table-footer to flex for better alignment if not already
            if (!content.includes('justify-content: space-between')) {
                // Simple heuristic: just replace the class or ensure it has right styling. 
                // We'll leave styling to global css or inline if needed.
                // I will replace `<div class="table-footer">` with a styled one if needed, but let's just use flex styles inline or in global css.
            }

            fs.writeFileSync(file, content);
            console.log(`Updated ${file} with data: ${varName}`);
            updatedCount++;
        }
    }
});

console.log(`\nFinished! Updated ${updatedCount} files.`);
