export const getTimestamp = (): string => Date.now().toString();

//x request id 
export const generateRequestId = (): string => `req_${Date.now()}`;