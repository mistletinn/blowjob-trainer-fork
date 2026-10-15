const fs = require('fs')
const path = require('path')

// The root version is maintained manually
const versionFilePath = path.join(__dirname, 'version.json')
const publicDirPath = path.join(__dirname, 'public')
const publicVersionFilePath = path.join(publicDirPath, 'version.json')

// Read the current version
let versionData
try {
    versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'))
} catch (error) {
    console.error('Error reading version.json:', error.message)
    process.exit(1)
}

if (!Number.isSafeInteger(versionData.version) || versionData.version < 1) {
    console.error('version.json must contain a positive integer version')
    process.exit(1)
}

// Ensure public directory exists
if (!fs.existsSync(publicDirPath)) {
    fs.mkdirSync(publicDirPath, { recursive: true })
}

// Copy to public directory so it can be accessed by the app
fs.writeFileSync(publicVersionFilePath, JSON.stringify(versionData, null, 2))

console.log(`Using version ${versionData.version}`) 
