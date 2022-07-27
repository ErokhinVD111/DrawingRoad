import {MapDataParser} from "./MapDataParser.js";
import {SpatParser} from "./SpatParser.js";

class Parser {
    static getMapDataObject(xmlFile) {
        return MapDataParser.getDataFromFile(xmlFile)
    }
    static getSpatObject(xmlFile) {
        return SpatParser.getDataFromFile(xmlFile)
    }
}

export {
    Parser
}