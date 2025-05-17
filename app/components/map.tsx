'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { MapView, type MapViewState, type Layer, type InteractionState } from '@deck.gl/core';
import { GeoJsonLayer, IconLayer, PolygonLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { LightingEffect, AmbientLight, DirectionalLight } from '@deck.gl/core';
import * as turf from '@turf/turf';
import type { FeatureCollection, Polygon } from 'geojson';
import styles from './map.module.css';
import sdk from '@farcaster/frame-sdk';
import Image from 'next/image';

const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 1.5 });
const directionalLight = new DirectionalLight({ color: [255, 255, 255], intensity: 2, direction: [-1, -1, -0.5] });
const lighting = new LightingEffect({
  ambientLight,
  directionalLight
});

const B = { minLon: -103.508, maxLon: -103.496, minLat: 41.805, maxLat: 41.815, minZoom: 15, maxZoom: 32 }
const V: MapViewState = { longitude: -103.5025, latitude: 41.8115, zoom: 16, pitch: 64, bearing: 42 }
const C: [number, number][] = [
  [41.81531997010784, -103.50398689690253],
  [41.81448939800076, -103.5039685447078],
  [41.81450328233114, -103.5047491709205],
  [41.8134905549828, -103.50475239876164],
  [41.813504388326436, -103.50611989484239],
  [41.81240455184571, -103.50613243946256],
  [41.812393148944686, -103.50401096548157],
  [41.80829532714985, -103.50411363033457],
  [41.80782978465289, -103.50268091031953],
  [41.81236784142759, -103.50259077118027],
  [41.81235594427294, -103.49886288185256],
  [41.81442735597784, -103.49882950056238],
  [41.81444253709233, -103.50163440752921],
  [41.81471886251136, -103.50190629348785],
  [41.81472338719567, -103.50258581950435],
  [41.81531490386476, -103.50253332189828],
  [41.81531997010784, -103.50398689690253]
].map(([lon, lat]) => [lat, lon]);
const POLY = turf.featureCollection([turf.polygon([[...C, C[0]]])])

const doesImageExist = async (iconKey: string): Promise<boolean> => {
  const url = `/assets/icons/${iconKey}.png`;  // Construct the image URL

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;  // If the response status is OK (200), return true
  } catch {
    return false;  // If fetch fails, assume the image doesn't exist
  }
};


export default function Map() {
  const [vs, setVS] = useState(V)
  const [parcels, setParcels] = useState<FeatureCollection<Polygon, any> | null>(null)
  const [mapData, setMapData] = useState<FeatureCollection<any, any> | null>(null)
  const [disc, setDisc] = useState('')
  const [sel, setSel] = useState<any>(null)
  const [card, setCard] = useState<'enter' | 'exit'>('exit')
  const [, setMapDragging] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  const interactedRef = useRef(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!sel || sel.id !== '__video') return;
    const interval = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "unMute",
          args: []
        }),
        "*"
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [sel])

  const [fcContext, setFcContext] = useState<any>(null)

  const [imageStatus, setImageStatus] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const checkImages = async () => {
      const iconsToCheck = [
        'calendar',
        'logo', 
        'hs_main',
        'minatare',
        'dg',
      ];
      const newImageStatus: Record<string, boolean> = {};
      for (const iconKey of iconsToCheck) {
        newImageStatus[iconKey] = await doesImageExist(iconKey);
      }
      setImageStatus(newImageStatus);
    };
    checkImages();
  }, []);

  const handleLinkClick = (url: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const open = sdk?.actions?.openUrl;
    if (typeof open === 'function' && e.nativeEvent instanceof PointerEvent && (window as any).fcMini) {
      e.preventDefault();
      try {
        open(url);
      } catch {
        window.open(url, '_blank');
      }
    }
  }

  useEffect(() => {
    (async () => {
      const ctx = await sdk.context;
      setFcContext(ctx);
    })();
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/assets/base.geojson').then(r => r.json()),
      fetch('/api/map.geojson').then(r => r.json()),
      fetch('/api/pub78?0=822040383&1=wa').then(r => r.text())
    ]).then(([g, v, d]) => {
      g.features.forEach((f: any) => {
        if (f.geometry.type === 'Polygon') f.properties ||= { elevation: 1 }
      })
      setParcels(g) 
      setMapData(v)
      setDisc(d)
    })
  }, [])

  const refreshMap = async () => {
    const v = await fetch('/api/map.geojson').then(r => r.json())
    setMapData(v) 
  }

  useEffect(() => {
    let isDown = false, moved = false;
    const onDown = () => { isDown = true; moved = false; };
    const onMove = () => { if (isDown) moved = true; };
    const onUp = (e: PointerEvent) => {
      const target = e.target as Node;
      const inCard    = ref.current?.contains(target);
      const inMap     = document.querySelector('.deckgl-overlay')?.contains(target);
      const inThemeBtn = document.querySelector('.themeBtn')?.contains(target); // added
      if (e.pointerType === 'touch' && inMap) {
        isDown = false;
        return;
      }
      if (!moved && !inCard && !inMap && !inThemeBtn) {
        setCard('exit');
        setSel(null);
      }
      isDown = false;
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
  }, [sel])

  useEffect(() => {
    const stop = () => { interactedRef.current = true }
    ['pointerdown', 'mousedown', 'touchstart'].forEach(evt =>
      window.addEventListener(evt, stop, true)
    )
    return () =>
      ['pointerdown', 'mousedown', 'touchstart'].forEach(evt =>
        window.removeEventListener(evt, stop, true)
      )
  }, [])

  useEffect(() => {
    if (interactedRef.current) return
    let id = 0, last = performance.now()
    const spin = (t: number) => {
      if (interactedRef.current) return cancelAnimationFrame(id)
      if (t - last > 16) {
        setVS(v => ({ ...v, bearing: ((v.bearing ?? 0) + 0.05) % 360 }))
        last = t
      }
      id = requestAnimationFrame(spin)
    }
    id = requestAnimationFrame(spin)
    return () => cancelAnimationFrame(id)
  }, [])

  const justSelected = useRef(false)

  const openCard = (o: any, p: [number, number]) => {
    justSelected.current = true
    requestAnimationFrame(() => { justSelected.current = false }) 
    const el = ref.current!
    setCard('exit')
    setTimeout(() => {
      el.style.transition = 'none'
      el.style.setProperty('--card-height', '64vh')
      el.style.transition = ''
      el.style.setProperty('--ty', 'translateY(0)')
      setSel({ ...o, clicked: p })
      setCard('enter')
    }, 300)
  }

  const handleCloseCard = () => {
    const el = ref.current!;
    requestAnimationFrame(() => {
      el.style.transition = 'none';
      el.style.setProperty('--card-height', '32vh');
      el.style.transition = '';
      el.style.setProperty('--ty', 'translateY(100%)');
      setCard('exit');
      setSel(null);
    });
  }

  // const toggleDonate = () => {
  //   const el = ref.current!
  //   const isDonateOpen = sel?.id === '__donate'
  //   if (isDonateOpen) {
  //     handleCloseCard()
  //   } else {
  //     requestAnimationFrame(() => {
  //       el.style.transition = 'none'
  //       el.style.setProperty('--card-height', '90vh')
  //       el.style.transition = ''
  //       el.style.setProperty('--ty', 'translateY(0)')
  //       setSel({ id: '__donate' })
  //       setCard('enter')

  //     })
  //   }
  // }

  const layers = useMemo<Layer[]>(() => {

    if (!parcels || !mapData) return []

    const logos = [
      {
        id:     'events',
        anchor: [-103.5037, 41.8155, 30],
        size:    42,
        opacity: 1,
        atlas:   '/assets/icons/calendar.webp',
        iconKey: 'logo',
        mapping: { logo: { x:0, y:0, width:512, height:512, mask:false } },
        url: ''
        // open events .card
      },
      {
        id:      'asr',
        anchor:  [-103.503, 41.81525, 20],
        size:    42,
        opacity: 0.25,
        atlas:   '/assets/icons/asr.png',
        iconKey: 'asr',
        mapping: { asr: { x:0, y:0, width:192, height:192, mask:false } },
        url: ''        
        // open donate .card
      },
      {
        id:      'mhs',
        anchor:  [-103.50163, 41.812624, 20],
        size:    42,
        opacity: 0.65,
        atlas:   '/assets/icons/hs_main.png',
        iconKey: 'mhs',
        mapping: { mhs: { x:0, y:0, width:1200, height:1200, mask:false } },
        url: 'https://www.minatareschools.org/' 
      },
      {
        id:      'minatare',
        anchor:  [-103.50350, 41.808786, 20],
        size:    32,
        opacity: 0.5,
        atlas:   '/assets/icons/minatare.png',
        iconKey: 'minatare',
        mapping: { minatare: { x:0, y:0, width:1600, height:1400, mask:false } },
        url: 'https://cityofminatare.com/' 
      },
      {
        id:      'dollar',
        anchor:  [-103.5, 41.81642, 20],
        size:    16,
        opacity: 0.25,
        atlas:   '/assets/icons/dg.png',
        iconKey: 'dollar',
        mapping: { dollar: { x:0, y:0, width:592, height:101, mask:false } },
        url: 'https://www.dollargeneral.com/store-directory/ne/minatare/23029' 
      }
    ] as const

    const logoLayers = logos.map(cfg => new IconLayer({
      id:           `map-image-${cfg.id}`,
      data:         [{ position: cfg.anchor, size: cfg.size, icon: cfg.iconKey }],
      iconAtlas:    cfg.atlas,
      iconMapping:  cfg.mapping,
      getIcon:      d => d.icon,
      getSize:      d => d.size,
      getPosition:  d => d.position,
      onClick:      () => {
        if (cfg.url) { 
          handleLinkClick(cfg.url);
        }
        refreshMap();
      },
      opacity:      cfg.opacity,
      sizeScale:    1,
      billboard:    true,
      pickable:     true,
      stroked:      true,
      autoHighlight:true,
      highlightColor:[255,255,255,75],
      parameters:   { depthTest: false }
    }))

    return [
      new GeoJsonLayer({
        id:'district', data:POLY, filled:true, stroked:false,
        getFillColor:[170,0,238,25], parameters:{depthTest:false}
      }),

      new GeoJsonLayer({
        id: 'parcels',
        data: parcels, pickable:false, filled:true, stroked:false,
        autoHighlight:true, parameters:{depthTest:false},
        highlightColor:[170,0,238,50],
        getFillColor:[128,128,128,33],
        getLineColor:[128,128,128,50],
        onClick: ({ coordinate, object }) => {
          refreshMap()
          const id = object?.id || object?.properties?.id
          const isSame = sel?.id === id
          if (isSame) {
            setCard('exit')
            setSel(null)
          } else if (
            object &&
            turf.booleanPointInPolygon(
              turf.point(coordinate as [number, number]),
              POLY.features[0]
            )
          ) {
            openCard(object, coordinate as [number, number])
          }
        }
      }),

      new PolygonLayer({
        id: 'rooms',
        data: mapData.features.filter(f => f.geometry.type === 'Polygon'),
        pickable: true,
        extruded: true,
        filled: true,
        autoHighlight: true,
        stroked: false,
        parameters: { depthTest: false },
        highlightColor: [170, 0, 238, 123],
        getPolygon: d => d.geometry.coordinates[0],
        getElevation: d => d.properties?.height || 0,
        getFillColor: d => d.properties.fillColor,
        onClick: ({ coordinate, object }) => {
          refreshMap();
          const parent = mapData.features.find(f =>
            f.geometry.type === 'MultiPolygon' &&
            f.id === object?.properties?.buildingId
          );
          const id = parent?.id;
          const isSame = sel?.id === id;

          if (isSame) {
            setCard('exit');
            setSel(null);
          } else if (parent && coordinate) {
            openCard(parent, coordinate.slice(0, 2) as [number, number]);
          }
        }
      }),

      new ScenegraphLayer({
        id: '3d-marker',
        data: [{ position: [-103.50343, 41.8088, 2] }],
        scenegraph: '/assets/models/gift.glb',
        getPosition: d => d.position,
        sizeScale: 10,
        opacity: 1,
        getOrientation: [0, 15, 90],
        pickable: true,
        _lighting: 'flat',
        _animations: {
          '*': { playing: true, speed: 1, startTime: 0 }
        },
        autoHighlight: true,
        highlightColor: [255, 255, 255, 100],
        parameters: { depthTest: true },
        stroked: true,
        onClick: () => { refreshMap(); },
      }),

      ...logoLayers,
    ]
  }, [parcels, mapData, sel])

  const THRESHOLD = 5
  const dragStartY = useRef(0)
  const dragged = useRef(false)

  const onDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) return;

    dragStartY.current = e.clientY;
    dragged.current = false;
    const el = ref.current!;
    el.setPointerCapture(e.pointerId);
    el.classList.add(styles['dragging']);
  };

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current!
    if (!el.hasPointerCapture(e.pointerId)) return
    const dy = e.clientY - dragStartY.current
    if (Math.abs(dy) > THRESHOLD) dragged.current = true
    const base = parseFloat(el.style.getPropertyValue('--card-height') || '64')
    const newH = base - (dy / window.innerHeight) * 100
    el.style.setProperty('--card-height', `${Math.max(0, Math.min(100, newH))}vh`)
    dragStartY.current = e.clientY
  }

  const onUp = (e: React.PointerEvent) => {
    const el = ref.current!
    if (!el.hasPointerCapture(e.pointerId)) return
    el.releasePointerCapture(e.pointerId)
    el.classList.remove(styles['dragging'])
    const h = parseFloat(el.style.getPropertyValue('--card-height') || '64vh')
    if (!dragged.current && h >= 20) return
    if (h < 33) {
      el.style.setProperty('--card-height', '32vh')
      el.style.setProperty('--ty', 'translateY(100%)')      
      setCard('exit')
      setSel(null)
    } else {
      el.style.setProperty('--card-height', `${Math.min(h, 100)}vh`)
    }
  }

  const renderCard = () => {
  if (!sel) return null;

  const getImageSrc = (src: string | null) => {
    return src ?? '/path/to/default/image.png';
  };




const renderJsonDisplay = (data: any) => {
  if (Array.isArray(data)) {
    return (
      <div className="json-display">
        {data.map((i, index) => (
          <div key={index} className="json-item">
            <strong>{i.label}</strong>
            <p>{i.about}</p>
            <small>{i.type}</small>
          </div>
        ))}
      </div>
    );
  } else if (typeof data === 'object' && data !== null) {
    return (
      <div className="json-display">
        {data.label && (
          <div className="json-item">
            <strong>{data.label}</strong>
            <p>{data.about}</p>
            <small>{data.type}</small>
          </div>
        )}
      </div>
    );
  } else {
    return <span>{data}</span>;
  }
};


  if (sel?.id === '__donate') {
    return (
      <div className={styles['embed']}>
        <div className={styles['embedBody']}>
          <div className={styles['aboutCard']}>
            <p>Fundraising campaigns will be posted here when they happen but there are currently no special campaigns active, check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  if (sel?.id === '__events') {
    return (
      <div className={styles['embed']}>
        <div className={styles['embedBody']}>
          <div className={styles['aboutCard']}>
            <p>Summer events and more are coming. Check back later when activity and event itinerary entries are finalized this season!</p>
          </div>
        </div>
      </div>
    );
  }

  if (sel?.id === '__feature') {
    return (
      <div className={styles['embed']}>
        <div className={styles['embedBody']}>
          <div className={styles['aboutCard']}>
            <p>The Broken Spoke has new ownership! Let us give them a hand and support them how we can. We hope to feature their menu soon once they get settled in!</p>
          </div>
        </div>
      </div>
    );
  }

  if (sel?.id === '__video') {
    return (
      <div className={styles["embed"]}>
        <div className={styles["embedBody"]}>
          <iframe
            ref={iframeRef}
            className={styles["aboutCard"]}
            title="bgv"
            src={`https://www.youtube.com/embed/O92pNqLD0tY?autoplay=0&controls=1&loop=1&showinfo=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <p><strong>A Stage Reborn™ is building a Creative District with the City of Minatare, and you can be a part of it too!</strong> All proceeds donated through here go directly towards Minatare{"'"}s Creative District development and revitalization.</p>
          <div className={styles["panel-actions"]}>
            {fcContext?.user?.fid && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    sdk.actions.composeCast({
                      text: "🎭 Let's build a Creative District together!\n\nI support A Stage Reborn™ making the arts more accessible. You should too.",
                      embeds: ["https://astagereborn.com"],
                    })
                  }
                >
                  📣 Share
                </button>
                <button type="button" onClick={() => sdk.actions.addFrame()}>
                  ➕ Add
                </button>
              </>
            )}
            <a
              href="https://www.paypal.com/us/fundraiser/charity/2456458"
              onClick={() => handleLinkClick("https://www.paypal.com/us/fundraiser/charity/2456458")}
              target="_blank"
              rel="noopener noreferrer"
            >
              PayPal
            </a>
            <a
              href="https://www.patreon.com/astagereborn"
              onClick={() => handleLinkClick("https://www.patreon.com/astagereborn")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Patreon
            </a>
            <a
              href="https://giveth.io/project/a-stage-reborn-is-building-a-citys-creative-district"
              onClick={() => handleLinkClick("https://giveth.io/project/a-stage-reborn-is-building-a-citys-creative-district")}
              target="_blank"
              rel="noopener noreferrer"
            >
              GivETH
            </a>
            <a
              href="https://commerce.coinbase.com/checkout/f2cde1b3-33c8-4661-818d-d2cba25dc826"
              onClick={() => handleLinkClick("https://commerce.coinbase.com/checkout/f2cde1b3-33c8-4661-818d-d2cba25dc826")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Coinbase
            </a>
            <a
              href="https://causes.benevity.org/causes/840-822040383"
              onClick={() => handleLinkClick("https://causes.benevity.org/causes/840-822040383")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Benevity
            </a>
          </div>
          <p>The City of Minatare is building its future through this program with us serving as their district administrator <em>completely free</em>.</p>
          <ul>
            <li>✅ Public art, performances & festivals.</li>
            <li>✅ Family programs & arts education.</li>
            <li>✅ Community building restoration.</li>
            <li>✅ Downtown revitalization.</li>
            <li>✅ Historic preservation.</li>
            <li>✅ Global collaboration.</li>
          </ul>
          <p>In 2020, the Nebraska legislature enacted our Creative Districts program. <a href="https://www.artscouncil.nebraska.gov/explore/certified-creative-districts/" onClick={() => handleLinkClick("https://www.artscouncil.nebraska.gov/explore/certified-creative-districts/")} target="_blank" rel="noopener noreferrer"><strong>Creative Districts<small>🔗</small></strong></a> are designated areas in cities and towns where arts, culture, and creativity are used to boost the local economy, support small businesses, and bring the community together. It often includes cultural assets such as public art, performances, historic spaces, and more led by local artists and organizations.</p>
          <p>In 2024, the City reached out about collaborating on this endeavor as part of a greater effort to bring 1000+ people back to Minatare and revitalize the city. We then received a $10,000 grant from the Sherwood Foundation to catalyze our plan after which our proposal was formally approved by city council in April of 2025.</p>
          <p>Your help now will directly accelerate the infrastructure, labor effort, and programming needs beyond our starting point by giving us the resources to work better towards our goals over the coming years. Nebraska{"'"}s Creative Districts can also access over $100,000 in annual state funding for development and more, but public support like yours is what spotlights a district to these agencies and leads to stronger continual state-led backing.</p>
          <p>A Stage Reborn™ is a 501(c)(3) nonprofit founded in 2015 to make the arts more accessible. What began in the virtual over a decade ago has evolved into real-world impact, from digital theater to public art, career development, and revitalization efforts like Minatare{"'"}s Creative District.</p>
          <p>We operate as a hybrid-remote, volunteer-powered nonprofit focused on overcoming barriers and innovating in how the arts serve people and places. We take transformative action in the arts including not just production but facilitation to innovate making arts more accessible for everyone. Have ideas you want to share?</p>
          <div className={styles["panel-actions"]}>
            <a
              href="mailto:admin@astagereborn.com"
              onClick={fcContext?.user?.fid ? () => handleLinkClick("mailto:admin@astagereborn.com") : undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              Email
            </a>
            <a 
              href="https://facebook.com/astagereborn" 
              onClick={fcContext?.user?.fid ? () => handleLinkClick("https://facebook.com/astagereborn") : undefined}
              target="_blank" rel="noopener noreferrer">Facebook</a>
            <a 
              href="https://warpcast.com/pederzani.eth" 
              onClick={fcContext?.user?.fid ? () => handleLinkClick("https://warpcast.com/pederzani.eth") : undefined} 
              target="_blank" rel="noopener noreferrer">Farcaster</a>
            <a 
              href="https://discord.gg/astagereborn" 
              onClick={fcContext?.user?.fid ? () => handleLinkClick("https://discord.gg/astagereborn") : undefined}
              target="_blank" rel="noopener noreferrer">Discord Server</a>
            <a 
              href="https://x.com/astagereborn" 
              onClick={fcContext?.user?.fid ? () => handleLinkClick("https://x.com/astagereborn") : undefined}
              target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          </div>
        </div>
      </div>
    );
  }

  const buttons = sel.properties?.buttons;

  return (
    <div className={styles["embed"]}>
      <div className={styles["embedBody"]}>
        <div className={styles["author"]}>
          {sel?.properties?.thumbnailUrl && imageStatus[sel.properties.thumbnailUrl] && (
            <Image
              src={getImageSrc(sel.properties.thumbnailUrl)}
              alt="Logo"
              width={500}
              height={500}
              draggable={false}
              className={styles["slate"]}
            />
          )}

          <a href={`mailto:${sel.properties.ownerEmail}`} className={styles["authorName"]}>
            {sel.properties.ownerName}
          </a>
        </div>
        <div className={styles["desc"]}>{sel.properties.description}</div>
        <div className={styles["jsonDisplay"]}>
          {renderJsonDisplay(sel.properties)}
        </div>
      </div>
      {Array.isArray(buttons) && buttons.length > 0 && (
        <div className={styles["buttons"]}>
          {buttons.map((btn, i) => (
            <a
              key={i}
              href={btn.v}
              onClick={() => handleLinkClick(btn.v)}
              className={styles["btn"]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {btn.k}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};


  const toggleAbout = () => {
    if (sel?.id === '__video') {
      handleCloseCard();
      return;
    }
    const el = ref.current!;
    if (sel) {
      handleCloseCard();
      setTimeout(() => {
        el.style.setProperty('--card-height', '90vh');
        el.style.setProperty('--ty', 'translateY(0)');
        setSel({ id: '__video' });
        setCard('enter');
      }, 300);
    } else {
      el.style.setProperty('--card-height', '90vh');
      el.style.setProperty('--ty', 'translateY(0)');
      setSel({ id: '__video' });
      setCard('enter');
    }
  }
  
  return (
    <div className={styles['mapContainer']}>
      <div className={styles['title']}>
        <h1><small>City of Minatare</small></h1>
        <h1>&nbsp;CREATIVE DISTRICT (DRAFT)</h1>
      </div>
      <DeckGL
        effects={[lighting]}
        views={new MapView({ repeat: true })}
        viewState={vs}
        layers={layers}
        onInteractionStateChange={(s:InteractionState)=>setMapDragging(s.isDragging??false)}
        onViewStateChange={({viewState:v})=>
          setVS({
            longitude: Math.min(Math.max(v.longitude!,B.minLon), B.maxLon),
            latitude:  Math.min(Math.max(v.latitude!, B.minLat), B.maxLat),
            zoom:      Math.min(Math.max(v.zoom!, B.minZoom), B.maxZoom),
            pitch:     v.pitch!, 
            bearing:   v.bearing!
          })
        }
        controller={{ dragMode:'rotate', doubleClickZoom:false, scrollZoom:{ smooth:true, speed:0.02 } }}
      />
      <div
        ref={ref}
        className={[styles['card'], styles[card]].join(' ')}
        onClick={e => e.stopPropagation()}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <button
          type="button"
          className={styles['infoBtn']}
          aria-label="Info"
        >
          ?
        </button>
        <button
          type="button"
          className={styles['closeBtn']}
          onPointerDown={e => e.stopPropagation()}
          onPointerUp={e => { 
            e.stopPropagation(); 
            handleCloseCard(); 
          }}
          aria-label="Close"
        >
          ✕
        </button>
        {renderCard()}
      </div>
      <div>
        <button
          type="button"
          className={styles['aboutBtn']}
          onPointerDown={e => e.stopPropagation()}
          onPointerUp={e => {
            e.stopPropagation()
            toggleAbout()
          }}
          aria-label="About"
        >
          ❓
        </button>
      </div>
      {disc && (
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(disc)}`}
          className={styles['disclaimer']}
          alt="Disclaimer"
          width={480}
          height={64}
        />
      )}
  </div>
)}
