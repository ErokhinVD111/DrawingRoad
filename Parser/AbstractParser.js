import {xml2json} from "../xml2json.js";

class AbstractParser {
    static getDataFromFile(stringXML) {}

    static parseXMLtoJSON(stringXML) {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(stringXML, "text/xml")
        return JSON.parse(xml2json(xmlDoc).replace('undefined', ''))
    }
}

export {
    AbstractParser
}