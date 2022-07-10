export interface FileRequest extends File {
    originalname: string,
    mimetype: string,
    cloudStorageObject: string,
    cloudStorageError: Error,
    buffer: ArrayBuffer,
}
