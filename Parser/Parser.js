import {MapDataParser} from "./MapDataParser.js";
import {SpatParser} from "./SpatParser.js";
import {DenmParser} from "./DenmParser.js";

class Parser {
    static getMapDataObject(xmlFile) {
        return MapDataParser.getDataFromFile(xmlFile)
    }
    static getSpatObject(xmlFile) {
        return SpatParser.getDataFromFile(xmlFile)
    }
    static getDenmObject(xmlFile) {
        return DenmParser.getDataFromFile(xmlFile)
    }
}

export {
    Parser
}