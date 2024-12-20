const core = require("@actions/core");
const fs = require("fs");
const { run } = require("./main");

const getInputSpy = jest.spyOn(core, "getInput");
const setFailedSpy = jest.spyOn(core, "setFailed");
const infoSpy = jest.spyOn(core, "info");
const setOutputSpy = jest.spyOn(core, "setOutput");
const existsSyncSpy = jest.spyOn(fs, "existsSync");
const readFileSyncSpy = jest.spyOn(fs, "readFileSync");
const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");

describe("run", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fail if bump mode is invalid", async () => {
    getInputSpy.mockReturnValue("invalid-bump-mode");

    await run();

    expect(setFailedSpy).toHaveBeenCalledWith(
      "Invalid bump mode: invalid-bump-mode"
    );
  });

  test("should fail if package.json file is not found", async () => {
    getInputSpy.mockReturnValue("patch");
    existsSyncSpy.mockReturnValue(false);

    await run();

    expect(setFailedSpy).toHaveBeenCalledWith("package.json file not found");
  });

  test("should fail if package.json is invalid", async () => {
    getInputSpy.mockReturnValue("patch");
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue("invalid json");

    await run();

    expect(setFailedSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error parsing package.json")
    );
  });

  test("should fail if version field is missing in package.json", async () => {
    getInputSpy.mockReturnValue("patch");
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(JSON.stringify({}));

    await run();

    expect(setFailedSpy).toHaveBeenCalledWith(
      "No version field found in package.json"
    );
  });

  test("should fail if current version is invalid", async () => {
    getInputSpy.mockReturnValue("patch");
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(
      JSON.stringify({ version: "invalid-version" })
    );

    await run();

    expect(setFailedSpy).toHaveBeenCalledWith(
      "Invalid version in package.json: invalid-version"
    );
  });

  test("should update version and set output", async () => {
    getInputSpy.mockReturnValue("patch");
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "1.0.0" }));
    writeFileSyncSpy.mockImplementation(() => {});

    await run();

    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      "package.json",
      JSON.stringify({ version: "1.0.1" }, null, 2)
    );
    expect(infoSpy).toHaveBeenCalledWith(
      "Updated package.json version to: 1.0.1"
    );
    expect(setOutputSpy).toHaveBeenCalledWith("new-version", "1.0.1");
  });

  test("should update major version and reset minor and patch", async () => {
    getInputSpy.mockReturnValue("major");
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "1.2.3" }));
    writeFileSyncSpy.mockImplementation(() => {});

    await run();

    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      "package.json",
      JSON.stringify({ version: "2.0.0" }, null, 2)
    );
    expect(infoSpy).toHaveBeenCalledWith(
      "Updated package.json version to: 2.0.0"
    );
    expect(setOutputSpy).toHaveBeenCalledWith("new-version", "2.0.0");
  });

  test("should update minor version and reset patch", async () => {
    getInputSpy.mockReturnValue("minor");
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "1.2.3" }));
    writeFileSyncSpy.mockImplementation(() => {});

    await run();

    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      "package.json",
      JSON.stringify({ version: "1.3.0" }, null, 2)
    );
    expect(infoSpy).toHaveBeenCalledWith(
      "Updated package.json version to: 1.3.0"
    );
    expect(setOutputSpy).toHaveBeenCalledWith("new-version", "1.3.0");
  });
});
