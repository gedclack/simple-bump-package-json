const core = require("@actions/core");
const fs = require("fs");
const semverValid = require("semver/functions/valid");
const semverMajor = require("semver/functions/major");
const semverMinor = require("semver/functions/minor");
const semverInc = require("semver/functions/inc");
const { RELEASE_TYPES } = require("semver/internal/constants");

async function run() {
  try {
    const bumpMode = core.getInput("bump-mode");
    if (!RELEASE_TYPES.includes(bumpMode)) throw new Error(`Invalid bump mode: ${bumpMode}`);

    const packageJsonPath = "package.json";
    if (!fs.existsSync(packageJsonPath)) throw new Error("package.json file not found");

    const packageJson = fs.readFileSync(packageJsonPath, "utf8");
    let packageData;
    try {
      packageData = JSON.parse(packageJson);
    } catch (error) {
      throw new Error(`Error parsing package.json: ${error.message}`);
    }

    if (!packageData.version) throw new Error("No version field found in package.json");

    const currentVersion = packageData.version;
    if (!semverValid(currentVersion)) throw new Error(`Invalid version in package.json: ${currentVersion}`);

    const major = semverMajor(currentVersion);
    const minor = semverMinor(currentVersion);
    const newVersion = {
      major: `${major + 1}.0.0`,
      minor: `${major}.${minor + 1}.0`,
      patch: semverInc(currentVersion, "patch"),
    }[bumpMode];

    packageData.version = newVersion;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2) + "\n");
    core.info(`Updated package.json version to: ${newVersion}`);

    core.setOutput("new-version", newVersion);
  } catch (error) {
    core.setFailed(error.message);
  }
}

exports.run = run;
