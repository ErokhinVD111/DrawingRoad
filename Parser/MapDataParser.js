import {AbstractParser} from "./AbstractParser.js"

class MapDataParser extends AbstractParser {

    static getDataFromFile(stringXML) {

        const jsonObject = this.parseXMLtoJSON(stringXML)

        //Массив из перекрестков
        const arrayOfIntersections = []

        //Объект, который будет добавлен в массив
        const objectIntersection = {}

        objectIntersection['id'] = jsonObject['MapData']['intersections']['IntersectionGeometry']['id']

        const intersectionLat = jsonObject['MapData']['intersections']['IntersectionGeometry']['refPoint']['lat'] / 10000000
        const intersectionLon = jsonObject['MapData']['intersections']['IntersectionGeometry']['refPoint']['long'] / 10000000

        objectIntersection['refPoint'] = {lat: intersectionLat, lon: intersectionLon}

        try {
            objectIntersection['speedLimit'] = jsonObject['MapData']
                ['intersections']
                ['IntersectionGeometry']
                ['speedLimits']
                ['RegulatorySpeedLimit']
                ['speed']
        }
        catch (e) {

        }

        const lanesData = []

        jsonObject['MapData']['intersections']['IntersectionGeometry']['laneSet']['GenericLane'].forEach(genericLane => {
            const laneData = {}
            const connectingLanes = []
            try {
                genericLane['connectsTo']['Connection'].forEach(connection => connectingLanes.push(connection['connectingLane']['lane']))
            }
            catch (e) {

            }
            laneData['laneWidth'] = jsonObject['MapData']['intersections']['IntersectionGeometry']['laneWidth'] / 100
            laneData['connectingLanes'] = connectingLanes
            laneData['maneuvers'] = genericLane['maneuvers']
            laneData['laneID'] = genericLane['laneID']

            const nodeLat = []
            const nodeLon = []
            genericLane['nodeList']['nodes']['NodeXY'].forEach(node => {
                nodeLat.push(node['delta']['node-LatLon']['lat'] / 10000000)
                nodeLon.push(node['delta']['node-LatLon']['lon'] / 10000000)
            })
            laneData['lat'] = nodeLat
            laneData['lon'] = nodeLon

            laneData['directionalUse'] = genericLane['laneAttributes']['directionalUse']
            laneData['laneType'] = Object.keys(genericLane['laneAttributes']['laneType'])[0]
            laneData['sharedWith'] = genericLane['laneAttributes']['sharedWith']

            lanesData.push(laneData)
        })
        objectIntersection['lanesData'] = lanesData

        arrayOfIntersections.push(objectIntersection)

        return arrayOfIntersections

    }
}

export {
    MapDataParser
}