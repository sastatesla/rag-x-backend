const { Storage } = require("@google-cloud/storage");
const path = require("path");
const eventEmitter = require("../utils/logging");

class GCSHelper {
  constructor(bucketName) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const keyFilename = process.env.GOOGLE_CLOUD_KEYFILE;

    if (!projectId || !keyFilename) {
      throw new Error("GCS credentials not properly configured");
    }

    this.bucketName = bucketName || process.env.DEFAULT_GCS_BUCKET;
    this.storage = new Storage({
      projectId,
      keyFilename: path.resolve(keyFilename)
    });
  }

  async uploadFile(fileName, dataBuffer) {
    try {
      const destination = this.getFileKey(fileName);
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(destination);

      await file.save(dataBuffer);
      await file.makePublic();

      return this.getPublicUrl(destination);
    } catch (error) {
      eventEmitter.emit(
        "logging",
        `ERROR IN GCS HELPER - ${JSON.stringify(error)}`
      );
      throw error;
    }
  }

  async deleteFile(fileName) {
    try {
      const file = this.storage.bucket(this.bucketName).file(fileName);
      await file.delete();
      return true;
    } catch (error) {
      eventEmitter.emit(
        "logging",
        `ERROR IN GCS HELPER - ${JSON.stringify(error)}`
      );
      throw error;
    }
  }

  async listFiles() {
    try {
      const [files] = await this.storage.bucket(this.bucketName).getFiles();
      return files.map((file) => file.name);
    } catch (error) {
      eventEmitter.emit(
        "logging",
        `ERROR IN GCS HELPER - ${JSON.stringify(error)}`
      );
      throw error;
    }
  }

  async downloadFile(fileName) {
    try {
      const [contents] = await this.storage
        .bucket(this.bucketName)
        .file(fileName)
        .download();
      return contents;
    } catch (error) {
      eventEmitter.emit(
        "logging",
        `ERROR IN GCS HELPER - ${JSON.stringify(error)}`
      );
      throw error;
    }
  }

  async deleteAllFiles() {
    try {
      const [files] = await this.storage.bucket(this.bucketName).getFiles();
      await Promise.all(files.map((file) => file.delete()));
      return true;
    } catch (error) {
      eventEmitter.emit(
        "logging",
        `ERROR IN GCS HELPER - ${JSON.stringify(error)}`
      );
      throw error;
    }
  }

  getFileKey(fileName) {
    return `uploads/${Date.now()}-${fileName}`
      .replace(/\s+/g, "-")
      .toLowerCase();
  }

  getPublicUrl(fileKey) {
    return `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;
  }
}

module.exports = GCSHelper;
