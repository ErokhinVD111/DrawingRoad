//получать все перекрестки и данные о всех дорогах
//(сделал)
function parseXML(stringXML) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(stringXML, "text/xml")
    const mapData = xmlDoc.getElementsByTagName("MapData")[0]
    const arrayOfIntersectionsData = []
    let lanesData
    mapData.childNodes.forEach(intersections => {
        const intersectionData = {}
        //находим node intersections
        if (intersections.nodeName === 'intersections') {
            intersections.childNodes[1].childNodes.forEach(node => {
                //находим node id
                if (node.nodeName === 'id') {
                    intersectionData['id'] = node.childNodes[1].textContent
                }
                //находим node refPoint
                if (node.nodeName === 'refPoint') {
                    let intersectionLatitude
                    let intersectionLongitude
                    node.childNodes.forEach((latlng) => {
                        if (latlng.nodeName === 'lat') {
                            const lat = latlng.textContent
                            intersectionLatitude = Number(lat.slice(0, 2) + "." + lat.slice(2))
                        } else if (latlng.nodeName === 'long') {
                            const lon = latlng.textContent
                            intersectionLongitude = Number(lon.slice(0, 2) + "." + lon.slice(2))
                        }
                    })
                    intersectionData['refPoint'] = {lat: intersectionLatitude, lon: intersectionLongitude}
                }
                //находим node laneWidth
                if (node.nodeName === 'laneWidth') {
                    intersectionData['laneWidth'] = Number(node.textContent)
                }
                //находим node laneSet
                if (node.nodeName === 'laneSet') {
                    lanesData = []
                    node.childNodes.forEach(genericLane => {
                        const laneData = {}
                        //находим node GenericLane
                        if (genericLane.nodeName === 'GenericLane') {
                            genericLane.childNodes.forEach((childNode) => {
                                //находим node laneID
                                if (childNode.nodeName === 'laneID') {
                                    //console.log('laneID:' + childNode.textContent)
                                    laneData["laneID"] = childNode.textContent
                                }
                                //находим node ingressApproach
                                if (childNode.nodeName === 'ingressApproach') {
                                    //console.log('ingressApproach:' + childNode.textContent)
                                    laneData["ingressApproach"] = childNode.textContent
                                }
                                //находим node laneAttributes
                                if (childNode.nodeName === 'laneAttributes') {
                                    //console.log('laneAttributes:' + childNode.childNodes[1].textContent)
                                    laneData['directionalUse'] = childNode.childNodes[1].textContent
                                }
                                //находим node nodeList
                                if (childNode.nodeName === 'nodeList') {
                                    const arrayLat = []
                                    const arrayLon = []
                                    //внутри nodeList находим остальные nodes
                                    childNode
                                        .childNodes[1].childNodes.forEach((nodeXY) => {
                                        if (nodeXY.nodeName === 'NodeXY') {
                                            nodeXY.childNodes.forEach(delta => {
                                                if (delta.nodeName === 'delta') {
                                                    delta.childNodes.forEach(nodeLatLon => {
                                                        if (nodeLatLon.nodeName === 'node-LatLon') {
                                                            nodeLatLon.childNodes.forEach((latlng) => {
                                                                if (latlng.nodeName === 'lat') {
                                                                    const lat = latlng.textContent
                                                                    arrayLat.push(Number(lat.slice(0, 2) + "." + lat.slice(2)))
                                                                    //arrayLat.push(latlng.textContent)
                                                                } else if (latlng.nodeName === 'lon') {
                                                                    const lon = latlng.textContent
                                                                    arrayLon.push(Number(lon.slice(0, 2) + "." + lon.slice(2)))
                                                                    //arrayLon.push(latlng.textContent)
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                    laneData['lat'] = arrayLat
                                    laneData['lon'] = arrayLon
                                }
                                //находим node connectsTo
                                if (childNode.nodeName === 'connectsTo') {
                                    const connectingLane = []
                                    const signalGroup = []
                                    const connectionID = []
                                    childNode.childNodes.forEach(connection => {
                                        //внутри connectsTo находим остальные nodes
                                        if (connection.nodeName === 'Connection') {
                                            connection.childNodes.forEach(element => {
                                                if (element.nodeName === 'connectingLane') {
                                                    connectingLane.push(element.childNodes[1].textContent)
                                                }
                                                if (element.nodeName === 'signalGroup') {
                                                    signalGroup.push(element.textContent)
                                                }
                                                if (element.nodeName === 'connectionID') {
                                                    connectionID.push(element.textContent)
                                                }
                                            })
                                        }
                                    })
                                    laneData['connectingLane'] = connectingLane
                                    laneData['signalGroup'] = signalGroup
                                    laneData['connectionID'] = connectionID
                                }
                            })
                        }
                        if (Object.keys(laneData).length !== 0)
                            lanesData.push(laneData)
                    })
                    intersectionData['lanesData'] = lanesData
                }
            })
            if (Object.keys(intersectionData).length !== 0)
                arrayOfIntersectionsData.push(intersectionData)
        }
    })
    return arrayOfIntersectionsData
}

export {
    parseXML
}