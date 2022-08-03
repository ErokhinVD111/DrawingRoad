import {AbstractParser} from "./AbstractParser.js";

class SpatParser extends AbstractParser {
    static getDataFromFile(stringXML) {

        const jsonObject = this.parseXMLtoJSON(stringXML)

        const spatData = []
        const intersectionState = jsonObject['SPATEM']['spat']['intersections']['IntersectionState']

        const intersectionStateData = {}

        intersectionStateData['id'] = intersectionState['id']['id']
        intersectionStateData['moy'] = intersectionState['moy']
        intersectionStateData['timeStamp'] = intersectionState['timeStamp']

        const states = []
        intersectionState['states']['MovementState'].forEach(movementState => {
            movementState['state-time-speed']['MovementEvent'].forEach(movementEvent => {
                states.push({
                    signalGroup: movementState['signalGroup'],
                    eventState: Object.keys(movementEvent['eventState'])[0],
                    startTime: movementEvent['timing']['startTime'] / 10,
                    minEndTime: movementEvent['timing']['minEndTime'] / 10
                })
            })
        })
        intersectionStateData['states'] = states
        spatData.push(intersectionStateData)
        return spatData
    }
}

export {
    SpatParser
}