import {AbstractParser} from "./AbstractParser.js";

class DenmParser extends AbstractParser {
    static getDataFromFile(stringXML) {

        const jsonObject = this.parseXMLtoJSON(stringXML)

        const denmArray = []

        const denmObject = {}

        denmObject['originatingStationID'] = jsonObject['DENM']['denm']['management']['actionID']['originatingStationID']
        denmObject['sequenceNumber'] = jsonObject['DENM']['denm']['management']['actionID']['sequenceNumber']
        denmObject['detectionTime'] = jsonObject['DENM']['denm']['management']['detectionTime']
        denmObject['referenceTime'] = jsonObject['DENM']['denm']['management']['referenceTime']

        const eventPosition = {}

        eventPosition['lat'] = jsonObject['DENM']['denm']['management']['eventPosition']['latitude'] / 10000000
        eventPosition['lon'] = jsonObject['DENM']['denm']['management']['eventPosition']['longitude'] / 10000000

        denmObject['eventPosition'] = eventPosition

        const positionConfidenceEllipse = {}
        positionConfidenceEllipse['semiMajorConfidence'] = jsonObject['DENM']['denm']['management']['eventPosition']['positionConfidenceEllipse']['semiMajorConfidence']
        positionConfidenceEllipse['semiMinorConfidence'] = jsonObject['DENM']['denm']['management']['eventPosition']['positionConfidenceEllipse']['semiMinorConfidence']
        positionConfidenceEllipse['semiMajorOrientation'] = jsonObject['DENM']['denm']['management']['eventPosition']['positionConfidenceEllipse']['semiMajorOrientation']
        denmObject['positionConfidenceEllipse'] = positionConfidenceEllipse

        denmObject['altitudeValue'] = jsonObject['DENM']['denm']['management']['eventPosition']['altitude']['altitudeValue']
        denmObject['altitudeConfidence'] = Object.keys(jsonObject['DENM']['denm']['management']['eventPosition']['altitude']['altitudeConfidence'])[0]
        denmObject['relevanceDistance'] = Object.keys(jsonObject['DENM']['denm']['management']['relevanceDistance'])[0]
        denmObject['relevanceTrafficDirection'] = Object.keys(jsonObject['DENM']['denm']['management']['relevanceTrafficDirection'])[0]
        denmObject['validityDuration'] = jsonObject['DENM']['denm']['management']['validityDuration']
        denmObject['stationType'] = jsonObject['DENM']['denm']['management']['stationType']

        denmObject['informationQuality'] = jsonObject['DENM']['denm']['situation']['informationQuality']
        denmObject['informationQuality'] = jsonObject['DENM']['denm']['situation']['informationQuality']
        denmObject['informationQuality'] = jsonObject['DENM']['denm']['situation']['informationQuality']


        const eventType = {}
        eventType['causeCode'] = jsonObject['DENM']['denm']['situation']['eventType']['causeCode']
        eventType['subCauseCode'] = jsonObject['DENM']['denm']['situation']['eventType']['subCauseCode']
        denmObject['eventType'] = eventType

        const linkedCause = {}
        linkedCause['causeCode'] = jsonObject['DENM']['denm']['situation']['linkedCause']['causeCode']
        linkedCause['subCauseCode'] = jsonObject['DENM']['denm']['situation']['linkedCause']['subCauseCode']
        denmObject['linkedCause'] = linkedCause

        const eventSpeed = {}
        eventSpeed['speedValue'] = jsonObject['DENM']['denm']['location']['eventSpeed']['speedValue']
        eventSpeed['speedConfidence'] = jsonObject['DENM']['denm']['location']['eventSpeed']['speedConfidence']
        denmObject['eventSpeed'] = eventSpeed

        const pathHistory = []
        jsonObject['DENM']['denm']['location']['traces']['PathHistory']['PathPoint'].forEach(pathPoint => {
            const pathPosition = {}
            pathPosition['deltaLatitude'] = pathPoint['pathPosition']['deltaLatitude']
            pathPosition['deltaLongitude'] = pathPoint['pathPosition']['deltaLongitude']
            pathPosition['deltaAltitude'] = pathPoint['pathPosition']['deltaAltitude']
            pathHistory.push(pathPosition)
        })
        denmObject['pathHistory'] = pathHistory


        denmObject['innerhardShoulderStatus'] = Object.keys(jsonObject['DENM']['denm']['alacarte']['roadWorks']['closedLanes']['innerhardShoulderStatus'])[0]
        denmObject['outerhardShoulderStatus'] = Object.keys(jsonObject['DENM']['denm']['alacarte']['roadWorks']['closedLanes']['outerhardShoulderStatus'])[0]
        denmObject['drivingLaneStatus'] = jsonObject['DENM']['denm']['alacarte']['roadWorks']['closedLanes']['drivingLaneStatus']

        denmObject['restriction'] = jsonObject['DENM']['denm']['alacarte']['roadWorks']['restriction']['StationType']
        denmObject['speedLimit'] = jsonObject['DENM']['denm']['alacarte']['roadWorks']['speedLimit']
        denmObject['trafficFlowRule'] = Object.keys(jsonObject['DENM']['denm']['alacarte']['roadWorks']['trafficFlowRule'])[0]

        denmArray.push(denmObject)

        return denmArray

    }
}

export {
    DenmParser
}