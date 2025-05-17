// Migrating to D1 later.

import { NextResponse } from 'next/server'

export const runtime = 'edge'

type Anchor = [number, number]
type Point = [number, number]
type Point3D = [number, number, number]

function feetToLngLat3D([x, y]: Point, anchor: Anchor, z = 0): Point3D {
  const latPerFt = 1 / 364000
  const lonPerFt = 1 / (288200 * Math.cos(anchor[1] * Math.PI / 180))
  return [anchor[0] + x * lonPerFt, anchor[1] + y * latPerFt, z * 0.3048]
}

const buildings: Array<{
  id: string
  buttons: Array<{k:string,v:string}>
  name: string
  type: string
  about: string
  anchor: Anchor
  rooms: Array<{
    id: string
    label: string
    height: number
    elevation?: number
    fillColor: [number, number, number, number]
    coordsFeet: Point[]
  }>
  additionalProperties?: Record<string, unknown>
}> = [
  {
    id: '010085459',
    name: 'Community Room',
    type: 'municipal',
    about: `The City of Minatare Community Room is located on Main Street next to the Public Library. It is currently the focus of fundraising efforts to restore the building for the community to enjoy. The proposed Creative District intends to make this the first major renovation project to come from district development efforts.`,
    buttons: [
      {k: "TEST", v:"https://astagereborn.com"},
    ],
    anchor: [-103.5035212, 41.8090743],
    rooms: [
      { id: 'entry', label: 'Community Room', height: 10, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [-59.4167, 0], [-59.4167, -23.8333], [0, -23.8333]] },
      { id: 'storage', label: 'Storage', height: 8, fillColor: [170, 0, 238, 50], coordsFeet: [[-59, -3.5], [-64.1667, -3.5], [-64.1667, -13.8333], [-59, -13.8333]] },
      { id: 'kitchen', label: 'Kitchen', height: 8, fillColor: [170, 0, 238, 50], coordsFeet: [[-59, 0], [-59, -3.4167], [-64.0833, -3.4167], [-64.0833, -13.75], [-73.75, -13.75], [-73.75, 0]] },
      { id: 'bathroom', label: 'Bathroom', height: 8, fillColor: [170, 0, 238, 50], coordsFeet: [[-59, -13.75], [-66.75, -13.75], [-66.75, -23], [-62.0833, -23], [-62.0833, -20.4167], [-59, -20.4167]] },
      { id: 'storage_2', label: 'Storage', height: 8, fillColor: [170, 0, 238, 50], coordsFeet: [[-66.75, -13.75], [-73.75, -13.75], [-73.75, -23], [-66.75, -23]] },
      { id: 'main_2', label: 'Upper Floor', height: 10, elevation: 10, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [-74.25, 0], [-74.25, -23.8333], [0, -23.8333]] }
    ]
  },

  {
    id: 'elementary_nw',
    buttons: [],
    name: 'Minatare Elementary NW Corner',
    type: 'education',
    about: 'Top-left (NW) corner of Minatare Elementary campus.',
    anchor: [-103.50582776433009, 41.8133164090049],
    rooms: [
      { id: 'footprint', label: 'Building Footprint', height: 15, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [15, 0], [15, -15], [0, -15]] },
    ]
  },
  {
    id: 'elementary_north_small',
    buttons: [],
    name: 'Minatare Elementary North Small Building',
    type: 'education',
    about: 'Northern small building at Minatare Elementary.',
    anchor: [-103.50532024285641, 41.81331408784005],
    rooms: [
      { id: 'footprint', label: 'Building Footprint', height: 12, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [12, 0], [12, -12], [0, -12]] },
    ]
  },
  {
    id: 'elementary_south_bldg',
    buttons: [],
    name: 'Minatare Elementary South Building',
    type: 'education',
    about: 'Southern building at Minatare Elementary.',
    anchor: [-103.50532266212153, 41.813157230031194],
    rooms: [
      { id: 'footprint', label: 'Building Footprint', height: 12, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [12, 0], [12, -12], [0, -12]] },
    ]
  },
  {
    id: 'elementary_play_area',
    buttons: [],
    name: 'Minatare Elementary Play Area',
    type: 'recreation',
    about: 'Flag square play area at Minatare Elementary.',
    anchor: [-103.50551058837623, 41.813081952335075],
    rooms: [
      { id: 'play', label: 'Play Area', height: 1, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [20, 0], [20, -20], [0, -20]] },
    ]
  },
  {
    id: 'park_covered_area',
    buttons: [],
    name: 'City Park Covered Area',
    type: 'recreation',
    about: 'Covered pavilion in City Park.',
    anchor: [-103.50393708834602, 41.813969471471026],
    rooms: [
      { id: 'pavilion', label: 'Pavilion', height: 12, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [30, 0], [30, -20], [0, -20]] },
    ]
  },
  {
    id: 'park_court',
    buttons: [],
    name: 'City Park Court',
    type: 'recreation',
    about: 'Basketball/tennis court in City Park.',
    anchor: [-103.50418803677337, 41.814093599653496],
    rooms: [
      { id: 'court', label: 'Court', height: 0.2, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [60, 0], [60, -30], [0, -30]] },
    ]
  },
  {
    id: 'park_play_area',
    buttons: [],
    name: 'City Park Play Area',
    type: 'recreation',
    about: 'Children’s play area in City Park.',
    anchor: [-103.50441630095857, 41.813890434476534],
    rooms: [
      { id: 'play', label: 'Play Area', height: 1, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [20, 0], [20, -15], [0, -15]] },
    ]
  },
  {
    id: 'church_generic',
    buttons: [],
    name: 'City Church',
    type: 'religion',
    about: 'Main church building in Minatare.',
    anchor: [-103.50386448352232, 41.814872638726655],
    rooms: [
      { id: 'sanctuary', label: 'Sanctuary', height: 20, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [40, 0], [40, -30], [0, -30]] },
    ]
  },
  {
    id: 'presb_church',
    buttons: [],
    name: 'Presbyterian Church',
    type: 'religion',
    about: 'Minatare Presbyterian Church.',
    anchor: [-103.5018139535827, 41.81075088286151],
    rooms: [
      { id: 'sanctuary', label: 'Sanctuary', height: 18, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [35, 0], [35, -25], [0, -25]] },
    ]
  },
  {
    id: 'church_of_christ',
    buttons: [],
    name: 'Church of Christ',
    type: 'religion',
    about: 'Church of Christ in Minatare.',
    anchor: [-103.50532773925077, 41.81225492285991],
    rooms: [
      { id: 'sanctuary', label: 'Sanctuary', height: 18, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [30, 0], [30, -20], [0, -20]] },
    ]
  },
  {
    id: 'hs_main',
    buttons: [],
    name: 'Minatare High School Main',
    type: 'education',
    about: 'Main building of Minatare Jr/Sr High School.',
    anchor: [-103.50148449915282, 41.81287015120879],
    rooms: [
      { id: 'main', label: 'Main Bldg', height: 20, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[-1, 27], [22, 27], [22, 3], [102, 2], [101, -76], [-1, -75]] },
    ]
  },
  {
    id: 'hs_back',
    buttons: [],
    name: 'High School Annex (Back)',
    type: 'education',
    about: 'Back annex at Minatare High School.',
    anchor: [-103.5017603042083, 41.813268869994594],
    rooms: [
      { id: 'annex', label: 'Annex', height: 15, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[0, 4], [151, 2], [151, -39], [-0.8, -37]] },
    ]
  },
  {
    id: 'hs_side',
    buttons: [],
    name: 'High School Side Wing',
    type: 'education',
    about: 'Side wing at Minatare High School.',
    anchor: [-103.5009428548105, 41.81292993548825],
    rooms: [
      { id: 'wing', label: 'Side Wing', height: 15, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 4], [80, 4], [80, -98], [0, -98]] },
    ]
  },
  {
    id: 'hs_small',
    buttons: [],
    name: 'High School Small Bldg',
    type: 'education',
    about: 'Small building on High School campus.',
    anchor: [-103.50066782134101, 41.81312064425859],
    rooms: [
      { id: 'small', label: 'Small Bldg', height: 12, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[0, 5], [37, 4], [37, -24], [61, -25], [61, -55], [0, -53]] },
    ]
  },
  {
    id: 'hs_track',
    buttons: [],
    name: 'High School Track',
    type: 'recreation',
    about: 'Athletic track at Minatare High School.',
    anchor: [-103.5003224616291, 41.81412801295259],
    rooms: [
      { id: 'track', label: 'Track Outline', height: 0.2, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[0, 10], [200, 10], [200, -580], [0, -580]] },
    ]
  },
  {
    id: 'firehouse',
    buttons: [],
    name: 'Firehouse',
    type: 'public_safety',
    about: 'Minatare Fire Department station.',
    anchor: [-103.50293555266684, 41.81224896634],
    rooms: [
      { id: 'station', label: 'Fire Station', height: 18, fillColor: [170, 0, 238, 50], coordsFeet: [[1, 4], [49, 3], [47, -213], [-1, -212]] },
    ]
  },
  {
    id: 'b_spoke',
    buttons: [
      { k:"Test", v:"https://www.facebook.com/brokenspokebarandgrill/" },
    ],
    name: 'Broken Spoke Bar & Grill',
    type: 'food_beverage',
    about: 'Historic bar on Main Street.',
    anchor: [-103.503844, 41.813136],
    rooms: [
      { id: 'interior', label: 'Bar Interior', height: 12, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[-10, 0], [20, 0], [20, -37], [27, -37], [27, -63], [43, -63], [43, -147], [3, -147], [3, -132], [-24, -132], [-24, -48], [-10, -48]] },
    ]
  },
  {
    id: 'bank',
    buttons: [],
    name: 'Old Bank Building',
    type: 'commercial',
    about: 'Former Platte Valley Bank, now City Hall.',
    anchor: [-103.50390608168556, 41.809410794879376],
    rooms: [
      { id: 'vault', label: 'Vault/Office', height: 12, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[1, 0], [85, 0], [85, -28], [1, -28]] },
    ]
  },
  {
    id: 'police_library',
    buttons: [],
    name: 'Police / Public Library',
    type: 'municipal',
    about: 'Combined Police Department and Library.',
    anchor: [-103.50399925659971, 41.808903442203615],
    rooms: [
      { id: 'building1', label: 'Building1', height: 15, fillColor: [170, 0, 238, 50], coordsFeet: [[20, 10], [39, 10], [39, 22], [103, 22], [103, -13], [20, -13]] },
      { id: 'building2', label: 'Building2', height: 15, fillColor: [170, 0, 238, 50], coordsFeet: [[39, 22], [103, 22], [103, 39], [39, 39]] },
    ]
  },
  {
    id: 'firemens_clubroom',
    buttons: [],
    name: 'Firemen’s Clubroom',
    type: 'fire_station_',
    about: 'Fire Station',
    anchor: [-103.50388333686386, 41.80845113298413],
    rooms: [
      { id: 'clubroom', label: 'Clubroom', height: 12, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[-2, 6], [78, 5], [77, -66], [32, -65], [-2, -47], [-2, 6]] },
    ]
  },
  {
    id: 'usps',
    buttons: [],
    name: 'USPS Post Office',
    type: 'municipal',
    about: 'United States Postal Service office.',
    anchor: [-103.50321652778288, 41.809251271743996],
    rooms: [
      { id: 'post_office', label: 'Post Office', height: 12, fillColor: [170, 0, 238, 50], 
        coordsFeet: [[2, 2], [42, 1], [42, -2], [50, -2], [50, -20], [42, -20], [42, -40], [1, -39], [2, 2]] },
    ]
  },
  {
    id: 'old_church',
    buttons: [],
    name: 'Old German Church',
    type: 'religion',
    about: 'St. Paul’s German Evangelical Lutheran, closed mid-20th century.',
    anchor: [-103.50307344619969, 41.811338239050606],
    rooms: [
      { id: 'sanctuary', label: 'Sanctuary', height: 18, fillColor: [170, 0, 238, 15], coordsFeet: [[-2, 6], [40, 5], [39, -24], [6, -24], [6, -15], [-2, -15]] },
    ]
  },
  {
    id: 'city_hall_oldbank',
    buttons: [],
    name: 'Minatare City Hall (Old Bank)',
    type: 'municipal',
    about: 'Former bank, now City Hall.',
    anchor: [-103.5008, 41.8108],
    rooms: [
      { id: 'footprint', label: 'Building Footprint', height: 15, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [20, 0], [20, -20], [0, -20], [0, 0]] },
    ]
  },
  {
    id: 'hs_1926',
    buttons: [],  
    name: 'Minatare High School (1926)',  
    type: 'education',  
    about: 'Original 1926 high school building.',  
    anchor: [-103.4945, 41.8089],  
    rooms: [  
      { id: 'footprint', label: 'Building Footprint', height: 20, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [40, 0], [40, -30], [0, -30], [0, 0]] },  
    ]  
  },
  {
    id: 'st_pauls_lutheran',
    buttons: [],
    name: 'St. Paul’s Lutheran Church (1916)',
    type: 'religion',
    about: 'Volga German church built 1916.',
    anchor: [-103.4980, 41.8117],
    rooms: [
      { id: 'sanctuary', label: 'Sanctuary', height: 18, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [30, 0], [30, -20], [0, -20], [0, 0]] },
    ]
  },
  {
    id: 'presb_church_old',
    buttons: [],
    name: 'Minatare Presbyterian Church (old)',
    type: 'religion',
    about: 'Early Presbyterian church site.',
    anchor: [-103.4997, 41.8109],
    rooms: [
      { id: 'sanctuary', label: 'Sanctuary', height: 18, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [30, 0], [30, -20], [0, -20], [0, 0]] },
    ]
  },
  {
    id: 'east_lawn_cemetery',
    buttons: [{ k: "Source", v: "https://www.interment.net" }],
    name: 'East Lawn Cemetery',
    type: 'cemetery',
    about: 'City cemetery established early 1900s.',
    anchor: [-103.5181, 41.8592],
    rooms: [
      { id: 'grounds', label: 'Cemetery Grounds', height: 0, fillColor: [170, 0, 238, 50], coordsFeet: [[0, 0], [200, 0], [200, -100], [0, -100], [0, 0]] },
    ]
  },
  {
    id: 'sugar_factory',
    buttons: [],
    name: 'Great Western Sugar Factory Site',
    type: 'industrial',
    about: 'Sugar beet processing factory (1926–1948).',
    anchor: [-103.4950, 41.8050],
    rooms: [
      { id: 'footprint', label: 'Factory Footprint', height: 25, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [60, 0], [60, -40], [0, -40], [0, 0]] },
    ]
  },
  {
    id: 'heinz_pickle',
    buttons: [],
    name: 'H.J. Heinz Pickle Plant Site',
    type: 'industrial',
    about: 'Pickle salting plant (1920s).',
    anchor: [-103.4970, 41.8090],
    rooms: [
      { id: 'footprint', label: 'Plant Footprint', height: 20, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [40, 0], [40, -30], [0, -30], [0, 0]] },
    ]
  },
  {
    id: 'water_tower',
    buttons: [],
    name: 'Water Tower',
    type: 'industrial',
    about: 'water tower',
    anchor: [-103.502945, 41.81267],
    rooms: [
{
      id: 'base', label: 'Base', height: 55, fillColor: [170, 0, 238, 50], coordsFeet: [
        [10,   0], 
        [7.07, 7.07], 
        [0,   10], 
        [-7.07,7.07],
        [-10,  0],
        [-7.07,-7.07],
        [0,  -10],
        [7.07,-7.07],
        [10,   0]
      ]
    }

    ]
  },
  {
    id: 'grain_elevator',
    buttons: [],
    name: 'Concrete Grain Elevator',
    type: 'industrial',
    about: '1940s slip-formed elevator.',
    anchor: [-103.5022, 41.8095],
    rooms: [
      { id: 'silos', label: 'Elevator Silos', height: 100, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [20, 0], [20, -20], [0, -20], [0, 0]] },
    ]
  },
  {
    id: 'three_cottonwoods',
    buttons: [],
    name: 'Three Giant Cottonwoods',
    type: 'natural_historic',
    about: 'Landmark trees from first settlement.',
    anchor: [-103.4900, 41.8100],
    rooms: [
      { id: 'trees', label: 'Trees', height: 30, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [10, 0], [10, -10], [0, -10], [0, 0]] },
    ]
  },
  {
    id: 'crazy_horse_burial',
    buttons: [],
    name: 'Crazy Horse Bundle Burial',
    type: 'historic',
    about: 'Legendary burial site of Crazy Horse’s sacred bundle (location lost).',
    anchor: [0, 0],
    rooms: [
      { id: 'burial', label: 'Approximate Area', height: 0, fillColor: [170, 0, 238, 15], coordsFeet: [[0, 0], [10, 0], [10, -10], [0, -10], [0, 0]] },
    ]
  }
]

export function GET() {
  const features = buildings.flatMap(b => {
    const roomFeatures = b.rooms.map(r => {
      const z = r.elevation ?? 0
      return {
        type: 'Feature' as const,
        id: `${b.id}_${r.id}`,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [r.coordsFeet.map(pt => feetToLngLat3D(pt, b.anchor, z))]
        },
        properties: {
          buildingId: b.id,
          label: r.label,
          height: r.height * 0.3048,
          fillColor: r.fillColor,
          ...(r.elevation !== undefined && { elevation: z * 0.3048 })
        }
      }
    })

    const groupFeature = {
      type: 'Feature' as const,
      id: b.id,
      geometry: {
        type: 'MultiPolygon' as const,
        coordinates: b.rooms.map(r => [
          r.coordsFeet.map(pt => feetToLngLat3D(pt, b.anchor, r.elevation ?? 0))
        ])
      },
      properties: {
        ...b,
        label: b.name,
        fillColor: [170, 0, 238, 30],
        rooms: b.rooms.map(r => ({
          id: r.id,
          label: r.label,
          height: r.height,
          elevation: r.elevation || 0
        }))
      }
    }

    return [...roomFeatures, groupFeature]
  })

  return NextResponse.json({ type: 'FeatureCollection', features })
}
