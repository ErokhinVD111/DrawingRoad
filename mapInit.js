import MapFactory from './mapFactory.js'

const objectMap = MapFactory.getMap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap'
})

//objectMap.map.setView([58.006323, 56.286684], 17)
objectMap.map.setView([57.9657406, 56.2447505], 17)
L.marker([57.9657406, 56.2447505]).addTo(objectMap.map).bindPopup("<p>Перекресток</p>")

// const latlngs1 = [
//     [57.9658852, 56.2440939],
//     [57.9659119, 56.2437187],
//     [57.9659344, 56.2434389],
//     [57.9659541, 56.2432196],
//     [57.9659810, 56.2429337],
//     [57.9659941, 56.2427843],
//     [57.9660029, 56.2426702],
//     [57.9660281, 56.2422869],
//     [57.9660688, 56.2416215],
//     [57.9660949, 56.2411725],
//     [57.9661317, 56.2405968]
// ]
//
// const latlngs2 = [
//     [57.9659518, 56.2440581],
//     [57.9661843, 56.2405376],
// ]

const arrayCoords = JSON.parse("[[{\"lat\": \"57.9657406\"}, {\"lon\": \"56.2447505\"}], [{\"lon\": \"56.2440939\"}, {\"lat\": \"57.9658852\"}, {\"lon\": \"56.2437187\"}, {\"lat\": \"57.9659119\"}, {\"lon\": \"56.2434389\"}, {\"lat\": \"57.9659344\"}, {\"lon\": \"56.2432196\"}, {\"lat\": \"57.9659541\"}, {\"lon\": \"56.2429337\"}, {\"lat\": \"57.9659810\"}, {\"lon\": \"56.2427843\"}, {\"lat\": \"57.9659941\"}, {\"lon\": \"56.2426702\"}, {\"lat\": \"57.9660029\"}, {\"lon\": \"56.2422869\"}, {\"lat\": \"57.9660281\"}, {\"lon\": \"56.2416215\"}, {\"lat\": \"57.9660688\"}, {\"lon\": \"56.2411725\"}, {\"lat\": \"57.9660949\"}, {\"lon\": \"56.2405968\"}, {\"lat\": \"57.9661317\"}], [{\"lon\": \"56.2440581\"}, {\"lat\": \"57.9659518\"}, {\"lon\": \"56.2405376\"}, {\"lat\": \"57.9661843\"}], [{\"lon\": \"56.2446554\"}, {\"lat\": \"57.9662234\"}, {\"lon\": \"56.2446828\"}, {\"lat\": \"57.9663330\"}, {\"lon\": \"56.2447211\"}, {\"lat\": \"57.9664812\"}, {\"lon\": \"56.2447646\"}, {\"lat\": \"57.9666783\"}, {\"lon\": \"56.2448028\"}, {\"lat\": \"57.9668406\"}, {\"lon\": \"56.2448301\"}, {\"lat\": \"57.9669524\"}, {\"lon\": \"56.2448540\"}, {\"lat\": \"57.9670447\"}, {\"lon\": \"56.2449188\"}, {\"lat\": \"57.9673153\"}, {\"lon\": \"56.2451985\"}, {\"lat\": \"57.9685843\"}], [{\"lon\": \"56.2446669\"}, {\"lat\": \"57.9662214\"}, {\"lon\": \"56.2446715\"}, {\"lat\": \"57.9662394\"}, {\"lon\": \"56.2447100\"}, {\"lat\": \"57.9663917\"}, {\"lon\": \"56.2447710\"}, {\"lat\": \"57.9666004\"}, {\"lon\": \"56.2448093\"}, {\"lat\": \"57.9668020\"}, {\"lon\": \"56.2448635\"}, {\"lat\": \"57.9670237\"}, {\"lon\": \"56.2449140\"}, {\"lat\": \"57.9671950\"}, {\"lon\": \"56.2452500\"}, {\"lat\": \"57.9685800\"}], [{\"lon\": \"56.2447137\"}, {\"lat\": \"57.9660774\"}, {\"lon\": \"56.2451200\"}, {\"lat\": \"57.9677153\"}], [{\"lon\": \"56.2447813\"}, {\"lat\": \"57.9660755\"}, {\"lon\": \"56.2451477\"}, {\"lat\": \"57.9676618\"}], [{\"lon\": \"56.2451262\"}, {\"lat\": \"57.9659279\"}, {\"lon\": \"56.2471968\"}, {\"lat\": \"57.9657800\"}], [{\"lon\": \"56.2451262\"}, {\"lat\": \"57.9658653\"}, {\"lon\": \"56.2471888\"}, {\"lat\": \"57.9657131\"}], [{\"lon\": \"56.2445468\"}, {\"lat\": \"57.9657600\"}, {\"lon\": \"56.2443027\"}, {\"lat\": \"57.9648666\"}], [{\"lon\": \"56.2446008\"}, {\"lat\": \"57.9655749\"}, {\"lon\": \"56.2445796\"}, {\"lat\": \"57.9654894\"}, {\"lon\": \"56.2445653\"}, {\"lat\": \"57.9654293\"}, {\"lon\": \"56.2445430\"}, {\"lat\": \"57.9653323\"}, {\"lon\": \"56.2445099\"}, {\"lat\": \"57.9651858\"}, {\"lon\": \"56.2444787\"}, {\"lat\": \"57.9650486\"}, {\"lon\": \"56.2444438\"}, {\"lat\": \"57.9648993\"}, {\"lon\": \"56.2444272\"}, {\"lat\": \"57.9648316\"}, {\"lon\": \"56.2444134\"}, {\"lat\": \"57.9647745\"}, {\"lon\": \"56.2443902\"}, {\"lat\": \"57.9646764\"}, {\"lon\": \"56.2443485\"}, {\"lat\": \"57.9645377\"}, {\"lon\": \"56.2443165\"}, {\"lat\": \"57.9644200\"}, {\"lon\": \"56.2442462\"}, {\"lat\": \"57.9641327\"}, {\"lon\": \"56.2439570\"}, {\"lat\": \"57.9628852\"}]]")
for(let j = 1; j < arrayCoords.length; j++) {
    const latlngs = []
    for (let i = 0; i < arrayCoords[j].length; i+=2) {
        try {
            latlngs.push([arrayCoords[j][i + 1]['lat'], arrayCoords[j][i]['lon']])
        }
        catch (e) {
            latlngs.push([arrayCoords[j][i]['lat'], arrayCoords[j][i+1]['lon']])
        }
    }
    console.table(latlngs)
    const polyline = L.polyline(latlngs, {color: 'red', weight: 2}).addTo(objectMap.map)
    objectMap.map.fitBounds(polyline.getBounds())
}


//
//
// const polyline1 = L.polyline(latlngs1, {color: 'red', weight: 2}).addTo(objectMap.map)
// const polyline2 = L.polyline(latlngs2, {color: 'red', weight: 2}).addTo(objectMap.map)
//
// // zoom the map to the polyline
// objectMap.map.fitBounds(polyline1.getBounds())
// objectMap.map.fitBounds(polyline2.getBounds())