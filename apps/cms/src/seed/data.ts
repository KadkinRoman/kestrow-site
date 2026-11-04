/**
 * Demo content for the Kestrow Motors showcase site: pages, inventory, customer stories, blog, offers, reviews,
 * FAQ, forms, settings and menus. Everything here is fictional. Photos are CC-licensed (see seed-assets/credits.json
 * and the /credits page on the site); an image is referenced by its file name in seed-assets/.
 * Content types keep the engine's internal names: a Strapi "kitchen" is a vehicle listing, "kitchen-category" a body type,
 * "project" a customer story, "material" an inspection area.
 */
import { h, p, ul, type Block } from './blocks';

const GROUPS = ['home', 'kitchen', 'about', 'offers', 'materials', 'warranty', 'payment', 'measurement', 'delivery', 'installation', 'contact', 'reviews'] as const;
export type Group = (typeof GROUPS)[number];

/* ---------- Pages (static routes of the front end) ---------- */

export const pages = [
  { slug: 'home', title: 'Home', path: '/', seo: { title: 'Inspected pre-owned cars in Denver, CO — Kestrow Motors', description: 'Hand-picked pre-owned and new cars with a 172-point inspection, no-haggle prices, a 7-day money-back guarantee, financing, trade-in and free home delivery.' } },
  { slug: 'cars', title: 'Cars', path: '/cars', seo: { title: 'Cars for sale in Denver', description: 'Kestrow Motors inventory: SUVs, sedans, pickup trucks, electric cars, wagons and sports cars — every one inspected, with a free vehicle history report.' } },
  { slug: 'offers', title: 'Special offers', path: '/offers', seo: { title: 'Special offers', description: 'Trade-in bonuses, low APR, free maintenance and other seasonal deals at Kestrow Motors.' } },
  { slug: 'about', title: 'About us', path: '/about', seo: { title: 'About Kestrow Motors', description: 'Kestrow Motors is a Denver dealership with its own inspection center. 172-point inspection, transparent pricing and a 12-month powertrain warranty on every car.' } },
  { slug: 'blog', title: 'Blog', path: '/blog', seo: { title: 'Blog', description: 'Practical guides on buying a car: financing, trade-in, hybrids and EVs, inspections and ownership.' } },
  { slug: 'stories', title: 'Customer stories', path: '/stories', seo: { title: 'Customer stories', description: 'Real Kestrow Motors customers: what they needed, which car they chose and what they paid.' } },
  { slug: 'contact', title: 'Contact', path: '/contact', seo: { title: 'Contact', description: 'Phone, showroom address and messengers — Kestrow Motors, 1180 Larkspur Avenue, Denver, CO.' } },
  { slug: 'reviews', title: 'Reviews', path: '/reviews', lead: 'Written reviews from our customers, collected on Google and Cars.com.', seo: { title: 'Kestrow Motors reviews', description: 'What our customers say: reviews of Kestrow Motors from Google and Cars.com.' } },
  { slug: 'guide', title: "Buyer's guide", path: '/guide', seo: { title: "Buyer's guide", description: 'Test drive, trade-in, home delivery, inspection, warranty and financing — everything about buying a car from Kestrow Motors.' } },
  { slug: 'test-drive', title: 'Test drive', path: '/guide/test-drive', seo: { title: 'Book a test drive', description: 'Book a no-pressure test drive at our Denver showroom — or we bring the car to you. A sales consultant answers every question.' } },
  { slug: 'trade-in', title: 'Trade-in', path: '/guide/trade-in', seo: { title: 'Trade-in valuation', description: 'Get a real offer for your current car in minutes. We look at the engine, brakes, tires, electronics, interior and body — and pay what it is worth.' } },
  {
    slug: 'home-delivery',
    title: 'Home delivery',
    path: '/guide/home-delivery',
    lead: 'Buy online, sign digitally and we bring the car to your door — free within 100 miles of Denver.',
    // "How home delivery works" tiles
    sections: [
      ['Choose and reserve', 'Pick a car online and put down a refundable deposit. We hold it for you while you check the report and arrange financing.'],
      ['Digital paperwork', 'Sign the purchase documents electronically. Our finance manager walks you through every line by phone or video call.'],
      ['Final prep', 'Before the car leaves the lot it is washed, detailed and re-checked by our technician. Fluids, tires and keys are verified one more time.'],
      ['Delivery to your door', 'A delivery coordinator drives the car to your address and hands over the keys. Delivery within 100 miles of Denver is free.'],
      ['7 days to decide', 'You have 7 days to drive the car. If it is not right for you, return it for a full refund under our money-back guarantee.'],
    ].map(([title, text]) => ({ title, body: [p(text)] })),
    seo: { title: 'Home delivery', description: 'Free Kestrow Motors home delivery within 100 miles of Denver, with a 7-day money-back guarantee.' },
  },
  {
    slug: 'inspection',
    title: 'Inspection',
    path: '/guide/inspection',
    lead: 'Every car we sell goes through the same 172-point inspection in our own service center. You can read the full report before you buy.',
    // "What the 172-point inspection covers" tiles
    sections: [
      { title: 'Engine & transmission', body: [ul(['Compression and leak check', 'Fluids and filters', 'Belts, hoses and mounts', 'Transmission shift test', 'Cooling system pressure test', 'Diagnostic scan for stored codes'])] },
      { title: 'Brakes & suspension', body: [ul(['Pad and rotor measurement', 'Brake fluid test', 'Shocks, struts and bushings', 'Steering and alignment', 'Wheel bearings', 'Axle and CV boots'])] },
      { title: 'Tires & wheels', body: [ul(['Tread depth on every tire', 'Matching brand and size', 'Wheel condition and balance', 'Spare and tools', 'TPMS sensors'])] },
      { title: 'Electronics & interior', body: [ul(['Infotainment, cameras and sensors', 'Climate control', 'Windows, locks and seats', 'Warning lights', 'Safety-system calibration', 'Odor and cleanliness check'])] },
      { title: 'What happens if a car does not pass?', body: [p('Anything that fails is repaired with quality parts and re-inspected. If it cannot be fixed to our standard, the car never reaches the lot — we sell roughly one in five cars we look at.')] },
    ],
    seo: { title: '172-point inspection', description: 'What the Kestrow Motors 172-point inspection covers: engine, brakes, tires, electronics, interior and body.' },
  },
  { slug: 'warranty', title: 'Warranty', path: '/guide/warranty', seo: { title: '12-month powertrain warranty', description: 'Every Kestrow Motors car comes with a 12-month / 12,000-mile limited powertrain warranty. Extended plans up to 5 years. What is covered and how to make a claim.' } },
  { slug: 'financing', title: 'Financing', path: '/guide/financing', seo: { title: 'Financing & pre-approval', description: 'Get pre-approved in 2 minutes with no impact on your credit score. APR from 5.9% for well-qualified buyers, terms of 36–72 months.' } },
  { slug: 'privacy-policy', title: 'Privacy Policy', path: '/privacy-policy', seo: { title: 'Privacy Policy', noIndex: true } },
];

/* ---------- Inventory ---------- */

export const categories = [
  { slug: 'suvs', name: 'SUVs', shortName: 'SUVs', order: 1 },
  { slug: 'sedans', name: 'Sedans', shortName: 'Sedans', order: 2 },
  { slug: 'pickup-trucks', name: 'Pickup trucks', shortName: 'Pickups', order: 3 },
  { slug: 'electric', name: 'Electric cars', shortName: 'Electric', order: 4 },
  { slug: 'hatchbacks-wagons', name: 'Hatchbacks & wagons', shortName: 'Hatch & wagon', order: 5 },
  { slug: 'sports-convertibles', name: 'Sports cars & convertibles', shortName: 'Sports', order: 6 },
];

const FUEL_LABEL: Record<string, string> = { gasoline: 'Gasoline', hybrid: 'Hybrid', 'plug-in-hybrid': 'Plug-in hybrid', electric: 'Electric', diesel: 'Diesel' };
const DRIVE_LABEL: Record<string, string> = { awd: 'AWD', 'four-wd': '4WD', fwd: 'FWD', rwd: 'RWD' };
const COLOR_LABEL: Record<string, string> = { white: 'White', black: 'Black', silver: 'Silver / gray', blue: 'Blue', red: 'Red' };

/** Vehicle collections (kitchen-tag): editors mark a car as part of a collection */
export const kitchenTags = [
  { slug: 'low-mileage', name: 'Under 30,000 miles', order: 1 },
  { slug: 'family-friendly', name: 'Family-friendly', order: 2 },
];

type Car = {
  name: string;
  body: string;
  category: string;
  fuel: string;
  drive: string;
  color: string;
  miles: number;
  price: number;
  oldPrice?: number;
  trans: string;
  engine: string;
  /** MPG for fuel cars, range for electric */
  economy: string;
  interior: string;
  owners: number;
  badge?: string;
  /** 'Title.|Text.' pairs */
  features: string[];
  about: [string, string];
  hit?: boolean;
  family?: boolean;
};

/** One entry per listing; the photo file is car-NN.jpg, NN = position in this list */
// Older cars on purpose: the cheapest listings are the 2010–2011 Camrys
const CARS: Car[] = [
  {
    name: '2021 Toyota RAV4 XLE Hybrid', body: 'SUV', category: 'suvs', fuel: 'hybrid', drive: 'awd', color: 'white', miles: 28400, price: 30400, oldPrice: 31500,
    trans: 'eCVT', engine: '2.5L 4-cylinder hybrid, 219 hp', economy: '40 MPG combined', interior: 'Black SofTex', owners: 1, badge: 'Great price', hit: true, family: true,
    features: ['Adaptive cruise control.|Toyota Safety Sense keeps its distance in Front Range traffic.', 'Electric AWD.|A rear motor adds grip on snowy canyon roads without a driveshaft.', 'Power moonroof.|Opens up the cabin on the drive to Boulder.', 'Blind-spot monitor.|Rear cross-traffic alert on the XLE trim.'],
    about: ['One-owner RAV4 Hybrid that has spent its life commuting between Aurora and downtown. It averages close to 40 MPG, so a full tank easily covers a week of driving.', 'The service history is complete, and our technicians replaced the cabin filter and wiper blades during the 172-point inspection. A very easy car to live with.'],
  },
  {
    name: '2020 Toyota RAV4 Limited', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'awd', color: 'white', miles: 41200, price: 28900,
    trans: '8-speed automatic', engine: '2.5L 4-cylinder, 203 hp', economy: '29 MPG combined', interior: 'Black leather', owners: 1, badge: 'One owner', family: true,
    features: ['Leather seats.|Heated and ventilated up front on the Limited.', 'Torque-vectoring AWD.|Sends power to the wheel with the most grip.', 'Hands-free liftgate.|Kick under the bumper when your arms are full.', 'Toyota Safety Sense 2.0.|Pre-collision, lane departure alert and radar cruise.'],
    about: ['The Limited is the top RAV4 trim, with leather, a premium JBL stereo and a 360-degree camera. This one is a single-owner car in Super White that has been garaged since new.', 'Dependable, efficient and quick to resell. New all-season tires were installed before listing.'],
  },
  {
    name: '2018 Toyota RAV4 XLE', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'awd', color: 'red', miles: 62300, price: 21400, oldPrice: 22400,
    trans: '6-speed automatic', engine: '2.5L 4-cylinder, 176 hp', economy: '26 MPG combined', interior: 'Black fabric', owners: 2, badge: 'Low miles', family: true,
    features: ['Available AWD.|Dynamic Torque Control for snow and gravel.', 'Power moonroof.|Standard on the XLE.', 'Backup camera.|With a 7-inch touchscreen.', 'Toyota Safety Sense P.|Pre-collision braking and lane departure alert.'],
    about: ['A reliable Colorado staple at an approachable price. This Barcelona Red RAV4 has covered 62,000 miles with regular dealer service and a clean history report.', 'Two owners, no accidents, and fresh brakes. A good first SUV or an easy second car for the family.'],
  },
  {
    name: '2017 Mazda CX-5 Grand Touring', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'awd', color: 'red', miles: 71500, price: 17900,
    trans: '6-speed automatic', engine: '2.5L SKYACTIV-G 4-cylinder, 187 hp', economy: '27 MPG combined', interior: 'Parchment leather', owners: 2, hit: true,
    features: ['Leather and heated seats.|Grand Touring comfort at a used-car price.', 'Bose audio.|Nine speakers tuned for the cabin.', 'i-Activsense safety.|Blind-spot monitoring and smart city braking.', 'Sharp handling.|Mazda\'s well-known driver-focused feel.'],
    about: ['The CX-5 is the crossover that still enjoys corners. In Soul Red with parchment leather, this Grand Touring is the nicest example of its age we have seen this year.', 'Two owners and full service records. We replaced the brake pads, rotors and battery during reconditioning.'],
  },
  {
    name: '2016 Mazda CX-5 Touring', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'fwd', color: 'blue', miles: 88400, price: 13900,
    trans: '6-speed automatic', engine: '2.5L SKYACTIV-G 4-cylinder, 184 hp', economy: '29 MPG combined', interior: 'Black cloth', owners: 3, badge: 'Great price',
    features: ['Up to 35 MPG highway.|Among the most efficient in its class.', 'Mazda Connect.|7-inch touchscreen with navigation.', 'Roomy cargo area.|Fold-flat rear seats.', 'Rear-view camera.|Standard on the Touring.'],
    about: ['An affordable way into a well-built crossover. The CX-5 Touring has the same engine and chassis as the pricier trims, in front-wheel-drive form.', 'Three owners, but every oil change is documented. The brakes, suspension and drivetrain all passed the 172-point inspection.'],
  },
  {
    name: '2019 Jeep Grand Cherokee Limited', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'four-wd', color: 'black', miles: 52700, price: 27900, oldPrice: 29400,
    trans: '8-speed automatic', engine: '3.6L Pentastar V6, 293 hp', economy: '21 MPG combined', interior: 'Tan leather', owners: 2, badge: 'Low miles', family: true,
    features: ['Quadra-Trac four-wheel drive.|Real traction for ski weekends.', 'Up to 6,200 lb towing.|Hitch up the camper or a trailer for the lake.', '8.4-inch Uconnect.|Navigation, Apple CarPlay and Android Auto.', 'Heated leather seats.|Plus a heated steering wheel for cold mornings.'],
    about: ['A proper full-size SUV with the comfort Grand Cherokee buyers expect: a quiet cabin, a soft ride and tan leather that still looks fresh. Four-wheel drive makes it a Colorado staple.', 'The V6 has plenty of power for towing, and the 8-speed transmission shifts smoothly. The price just dropped by $1,500.'],
  },
  {
    name: '2019 Lexus RX 350', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'awd', color: 'white', miles: 48900, price: 29900,
    trans: '8-speed automatic', engine: '3.5L V6, 295 hp', economy: '22 MPG combined', interior: 'Parchment leather', owners: 1, badge: 'One owner', family: true,
    features: ['Lexus Safety System+.|Pre-collision, lane departure alert and dynamic cruise control.', 'Quiet cabin.|Extra insulation that you notice on the highway.', 'Premium leather.|Heated and ventilated seats up front.', 'Power liftgate.|Easy loading, even with the dog in the back.'],
    about: ['The RX is famous for one thing: it simply does not give you trouble. This one has been garaged and serviced at the dealer, and its parchment leather shows almost no wear.', 'Smooth V6 power, a whisper-quiet ride and all-wheel drive for winter. If you want a luxury SUV that stays comfortable for a decade, start here.'],
  },
  {
    name: '2020 Mercedes-Benz GLC 300 4MATIC', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'awd', color: 'white', miles: 44600, price: 30900,
    trans: '9-speed automatic', engine: '2.0L turbo 4-cylinder, 255 hp', economy: '24 MPG combined', interior: 'Black MB-Tex', owners: 1, badge: 'Just arrived', hit: true,
    features: ['4MATIC all-wheel drive.|Confident grip in slush and on icy mornings.', 'COMAND infotainment.|Large display with navigation.', 'Panoramic roof.|A big glass roof over both rows.', 'Driver assistance.|Active brake assist and blind-spot assist.'],
    about: ['A polar white GLC with the 4MATIC system that suits our winters. The cabin is sleek and quiet, with the long options list that Mercedes buyers expect.', 'One owner, dealer-serviced, and the inspection found nothing beyond fresh wipers. Luxury-SUV comfort for the price of a mid-range crossover.'],
  },
  {
    name: '2017 Volvo XC60 T6 R-Design', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'awd', color: 'red', miles: 74200, price: 17400,
    trans: '8-speed automatic', engine: '2.0L turbo and supercharged 4-cylinder, 302 hp', economy: '23 MPG combined', interior: 'Black leather', owners: 2, family: true,
    features: ['Turbo and supercharger.|302 hp with strong passing power at altitude.', 'City Safety.|Automatic braking with pedestrian detection.', 'Sport seats.|R-Design bolsters with contrast stitching.', 'Sensus navigation.|With a 7-inch screen.'],
    about: ['The R-Design brings a sportier look and a stiffer ride to Volvo\'s calm, safety-first cabin. The 302 hp T6 engine is surprisingly quick for a family SUV.', 'Two owners and full service records. We checked the AWD system and replaced the brake pads before listing.'],
  },
  {
    name: '2016 Honda CR-V EX-L', body: 'SUV', category: 'suvs', fuel: 'gasoline', drive: 'awd', color: 'black', miles: 81300, price: 15900,
    trans: 'CVT', engine: '2.4L 4-cylinder, 185 hp', economy: '29 MPG combined', interior: 'Beige leather', owners: 2, family: true,
    features: ['Leather seats.|Heated in front, with a power driver seat.', 'Honda Sensing.|Lane-keeping and collision mitigation.', 'Huge cargo area.|Folds nearly flat for skis and flat-pack furniture.', 'Power moonroof.|Plus a rear camera and navigation.'],
    about: ['A CR-V keeps its value for a reason: it is comfortable, dependable and cheap to run. This EX-L with AWD is perfect for the daily commute and the weekend mountain trip.', 'Two owners and 81,000 miles with every service documented. The brakes and tires measured well.'],
  },
  {
    name: '2022 Tesla Model 3 Long Range', body: 'Sedan', category: 'electric', fuel: 'electric', drive: 'awd', color: 'white', miles: 31900, price: 27400,
    trans: 'Single-speed', engine: 'Dual-motor, long-range battery', economy: '358 mi EPA range', interior: 'Black vegan leather', owners: 1, badge: 'Great price', hit: true,
    features: ['358-mile range.|Enough for Denver to Glenwood Springs with a charge to spare.', 'Dual-motor AWD.|Quick off the line and sure-footed in snow.', 'Autopilot.|Traffic-aware cruise and autosteer.', 'Glass roof.|Lets in light for every seat.'],
    about: ['The Model 3 Long Range is still the benchmark for affordable EVs. Fast, efficient and very simple to live with, with over-the-air updates that keep adding features.', 'Battery health is checked in our inspection, and this car came back at excellent. It ships with the mobile connector and a wall-connector adapter.'],
  },
  {
    name: '2022 Hyundai Ioniq 5 SEL', body: 'SUV', category: 'electric', fuel: 'electric', drive: 'awd', color: 'silver', miles: 25500, price: 29900,
    trans: 'Single-speed', engine: 'Dual-motor, 77.4 kWh battery', economy: '256 mi EPA range', interior: 'Gray cloth/leatherette', owners: 1, family: true,
    features: ['800-volt fast charging.|From 10 to 80% in about 18 minutes on a fast charger.', 'Vehicle-to-load.|Power a camp stove or laptop from the car.', 'Sliding center console.|Flexible interior with a flat floor.', 'Highway Driving Assist.|Keeps lane and distance on the interstate.'],
    about: ['The Ioniq 5 looks like nothing else on the road and feels like a lounge inside. The flat floor and roomy back seat make it great for families.', 'Charging is quick and the 77.4 kWh pack is healthy. This SEL is a one-owner car that has only been home-charged.'],
  },
  {
    name: '2023 Hyundai Ioniq 5 Limited', body: 'SUV', category: 'electric', fuel: 'electric', drive: 'awd', color: 'silver', miles: 16800, price: 36400, oldPrice: 37900,
    trans: 'Single-speed', engine: 'Dual-motor, 77.4 kWh battery', economy: '260 mi EPA range', interior: 'Black leather', owners: 1, badge: 'Low miles', family: true, hit: true,
    features: ['Top Limited trim.|Leather, a Bose stereo and a head-up display.', 'Relaxation seats.|Reclining front seats with leg rests.', 'Panoramic sunroof.|Plus a digital rear-view mirror.', 'Remote Smart Parking.|Pull in and out of tight spaces from outside the car.'],
    about: ['The fully loaded Ioniq 5, with fewer than 17,000 miles. It offers the sharp looks, fast charging and spacious interior of the SEL, along with the luxury extras of the Limited.', 'A recent price drop of $1,500 puts it well below the cost of a new one. Includes the charging cable and a home-installation guide.'],
  },
  {
    name: '2022 Kia EV6 GT-Line', body: 'SUV', category: 'electric', fuel: 'electric', drive: 'awd', color: 'red', miles: 21300, price: 33900,
    trans: 'Single-speed', engine: 'Dual-motor, 77.4 kWh battery', economy: '274 mi EPA range', interior: 'Black leatherette', owners: 1, badge: 'Just arrived', hit: true,
    features: ['Dual-motor AWD.|320 hp and a very quick launch.', '800-volt charging.|Add about 70 miles in just 5 minutes of fast charging.', 'Curved dual displays.|Instrument and infotainment screens in one panel.', 'Meridian audio.|14 speakers with a subwoofer.'],
    about: ['The EV6 GT-Line is one of the best-driving electric crossovers you can buy: light on its feet, quiet and very quick. Runway Red paint makes it stand out on any street.', 'Under 22,000 miles, with a battery that tests at near-full capacity. It comes with a charging cable and a home-installation guide.'],
  },
  {
    name: '2023 Kia EV6 Wind', body: 'SUV', category: 'electric', fuel: 'electric', drive: 'rwd', color: 'silver', miles: 14500, price: 32400,
    trans: 'Single-speed', engine: 'Single-motor, 77.4 kWh battery', economy: '310 mi EPA range', interior: 'Black leatherette', owners: 1, badge: 'Just arrived',
    features: ['310-mile range.|The longest range of any EV6 trim.', '800-volt charging.|From 10 to 80% in about 18 minutes.', 'Vehicle-to-load.|Run a laptop, a coffee maker or a campsite light.', 'Highway Driving Assist.|Smart cruise with lane centering.'],
    about: ['The EV6 Wind in rear-wheel-drive form gets the best range in the lineup. A near-new, one-owner car with only 14,500 miles on the clock.', 'Perfect for a commute from Boulder or Colorado Springs. Battery health tested at 98%, and the charging cable is included.'],
  },
  {
    name: '2016 Chevrolet Silverado 1500 LTZ', body: 'Pickup', category: 'pickup-trucks', fuel: 'gasoline', drive: 'four-wd', color: 'blue', miles: 96300, price: 24900,
    trans: '6-speed automatic', engine: '5.3L EcoTec3 V8, 355 hp', economy: '18 MPG combined', interior: 'Jet black leather', owners: 2, hit: true,
    features: ['5.3L V8.|Smooth, with cylinder deactivation to save fuel.', 'Crew Cab.|Four full-size doors and a flat rear floor.', 'Leather seats.|Heated and ventilated up front on the LTZ.', 'Towing package.|Trailer hitch and brake controller.'],
    about: ['A well-equipped LTZ that has been driven gently. The 5.3L V8 is proven, quiet and strong enough to tow a boat or a camper.', 'It has 96,000 highway miles with documented service. A spray-in bed liner and running boards complete the package.'],
  },
  {
    name: '2017 Toyota Tacoma TRD Sport', body: 'Pickup', category: 'pickup-trucks', fuel: 'gasoline', drive: 'four-wd', color: 'white', miles: 68400, price: 28900, oldPrice: 30400,
    trans: '6-speed automatic', engine: '3.5L V6, 278 hp', economy: '20 MPG combined', interior: 'Black fabric', owners: 2, badge: 'Low miles',
    features: ['Part-time 4WD.|Switch to four-wheel drive with a dial.', 'Hood scoop and sport wheels.|The TRD Sport look.', 'Double Cab.|Four doors with a 5-foot bed.', 'Backup camera.|With a 7-inch touchscreen.'],
    about: ['Tacomas hold their value better than almost anything, and this one shows why. A sporty look and a V6 that makes the truck fun on the road.', 'Two owners, a clean history and recent service. A $1,500 price drop makes it a smart buy.'],
  },
  {
    name: '2014 Ford F-150 SVT Raptor', body: 'Pickup', category: 'pickup-trucks', fuel: 'gasoline', drive: 'four-wd', color: 'black', miles: 71800, price: 44900,
    trans: '6-speed automatic', engine: '6.2L V8, 411 hp', economy: '13 MPG combined', interior: 'Black leather', owners: 2, badge: 'Just arrived', hit: true,
    features: ['6.2L V8.|411 hp and 434 lb-ft for desert-style driving.', 'FOX Racing shocks.|Long-travel suspension for fast, rough roads.', 'Terrain Management.|Selectable modes including Baja.', 'Wide-body stance.|Raptor fender flares and 17-inch wheels.'],
    about: ['A first-generation SVT Raptor, now a modern classic and still one of the most capable trucks on the market. This one has never been modified and shows no signs of off-road abuse.', 'Two owners, full records, and an underbody that looks fresh. Rare, loud and a lot of fun.'],
  },
  {
    name: '2012 Toyota Tacoma PreRunner', body: 'Pickup', category: 'pickup-trucks', fuel: 'gasoline', drive: 'rwd', color: 'blue', miles: 118600, price: 14900,
    trans: '5-speed automatic', engine: '4.0L V6, 236 hp', economy: '18 MPG combined', interior: 'Graphite cloth', owners: 3, badge: 'Great price',
    features: ['4.0L V6.|A proven engine that regularly passes 250,000 miles.', 'Raised suspension.|PreRunner ride height with a rear-drive layout.', 'Double Cab.|Room for five with a 5-foot bed.', 'Towing hitch.|Rated for up to 6,500 lb.'],
    about: ['A simple, honest work truck with the most reliable V6 in its class. The PreRunner has the Tacoma\'s high stance without the cost of four-wheel drive.', 'It has 118,000 miles and a well-documented history. New tires, belts and fluids were done in our service center.'],
  },
  {
    name: '2011 Toyota Camry LE', body: 'Sedan', category: 'sedans', fuel: 'gasoline', drive: 'fwd', color: 'silver', miles: 112400, price: 9400,
    trans: '6-speed automatic', engine: '2.5L 4-cylinder, 169 hp', economy: '25 MPG combined', interior: 'Ash cloth', owners: 2, badge: 'Great price',
    features: ['Proven reliability.|One of the most dependable sedans ever built.', 'Roomy rear seat.|Comfortable for adults on longer trips.', 'Bluetooth and USB.|Easy phone connection.', 'Low running costs.|Inexpensive parts and easy service.'],
    about: ['A great first car or a backup commuter. The 2011 Camry LE is simple, quiet and comfortable, and it keeps going with very little drama.', 'Two owners and 112,000 miles of service records. New tires and brakes were installed before listing, and it passed the 172-point inspection.'],
  },
  {
    name: '2010 Toyota Camry SE', body: 'Sedan', category: 'sedans', fuel: 'gasoline', drive: 'fwd', color: 'silver', miles: 124700, price: 8900,
    trans: '6-speed automatic', engine: '2.5L 4-cylinder, 169 hp', economy: '24 MPG combined', interior: 'Charcoal cloth', owners: 3, badge: 'Great price',
    features: ['Sport-tuned suspension.|A firmer ride than the LE.', '17-inch alloy wheels.|SE styling with a sport grille.', 'Power driver seat.|And steering-wheel audio controls.', 'Low running costs.|Inexpensive parts and easy service.'],
    about: ['The least expensive car on our lot, and still one that passes the same 172-point inspection as the rest. The SE is the sportier trim of the 2010 Camry.', 'Three owners and 124,000 miles, with everything documented. A dependable, no-nonsense car for a student or a second driver.'],
  },
  {
    name: '2016 Subaru Outback 2.5i Premium', body: 'Wagon', category: 'hatchbacks-wagons', fuel: 'gasoline', drive: 'awd', color: 'silver', miles: 79800, price: 15900,
    trans: 'CVT', engine: '2.5L boxer 4-cylinder, 175 hp', economy: '28 MPG combined', interior: 'Black cloth', owners: 2, family: true, hit: true,
    features: ['Symmetrical AWD.|Standard and dependable in snow.', '8.7 inches of ground clearance.|Clears snowy driveways and dirt roads.', 'EyeSight driver assist.|Stereo-camera safety system.', 'Roof rails.|Ready for a cargo box or skis.'],
    about: ['The Outback is the unofficial car of Colorado, and for good reason. This 2.5i Premium is the sweet spot of the range, with a power liftgate and a big cargo bay.', 'Two owners and a well-documented history. We replaced the CVT fluid and tires before listing.'],
  },
  {
    name: '2011 Subaru Outback 3.6R Limited', body: 'Wagon', category: 'hatchbacks-wagons', fuel: 'gasoline', drive: 'awd', color: 'black', miles: 118200, price: 10900,
    trans: '5-speed automatic', engine: '3.6L boxer 6-cylinder, 256 hp', economy: '20 MPG combined', interior: 'Ivory leather', owners: 3, family: true,
    features: ['3.6L six-cylinder.|256 hp, the strongest engine in the Outback range.', 'Leather seats.|Heated front seats and a power driver seat.', 'Symmetrical AWD.|Capable in snow and mud.', 'Sunroof.|Plus a premium Harman Kardon stereo.'],
    about: ['The six-cylinder Outback is a rare find at this price. It has the extra power for passing on mountain roads and a plush Limited interior.', 'Three owners and 118,000 miles; the engine, CV boots and AWD system were all inspected and passed.'],
  },
  {
    name: '2009 Volkswagen GTI', body: 'Hatchback', category: 'hatchbacks-wagons', fuel: 'gasoline', drive: 'fwd', color: 'white', miles: 98500, price: 9900,
    trans: '6-speed manual', engine: '2.0L turbo 4-cylinder, 200 hp', economy: '24 MPG combined', interior: 'Plaid cloth', owners: 3, badge: 'Just arrived',
    features: ['6-speed manual.|The way hot hatches are meant to be driven.', 'Turbocharged 2.0T.|Strong mid-range pull for its size.', 'Plaid seats.|The classic GTI interior.', 'Sport suspension.|A tight, planted feel in the corners.'],
    about: ['For the driver who actually enjoys shifting, a clean manual GTI is a rare find. Quick, practical and fun on the canyon roads west of town.', 'Candy White paint and 98,000 miles. The timing chain, clutch and water pump were serviced, and the inspection report is spotless.'],
  },
  {
    name: '2013 Ford Mustang GT', body: 'Coupe', category: 'sports-convertibles', fuel: 'gasoline', drive: 'rwd', color: 'red', miles: 61300, price: 19900,
    trans: '6-speed manual', engine: '5.0L Coyote V8, 420 hp', economy: '19 MPG combined', interior: 'Charcoal leather', owners: 2, hit: true,
    features: ['420 hp V8.|The unmistakable sound of the Coyote.', '6-speed manual.|With a short, mechanical shifter.', 'Strong brakes.|Stopping power to match the engine.', 'Leather seats.|And a 6-speaker sound system.'],
    about: ['The 2013 GT has the 5.0L Coyote V8, a modern muscle-car classic. Race Red paint, black stripes and a manual gearbox.', 'Two owners and 61,000 well-cared-for miles. Never raced or modified, and the clutch measured like-new.'],
  },
  {
    name: '2008 Ford Mustang GT Premium', body: 'Coupe', category: 'sports-convertibles', fuel: 'gasoline', drive: 'rwd', color: 'white', miles: 89700, price: 11900, oldPrice: 12900,
    trans: '5-speed automatic', engine: '4.6L V8, 300 hp', economy: '18 MPG combined', interior: 'Dark charcoal leather', owners: 3, badge: 'Low miles',
    features: ['4.6L V8.|300 hp and a classic muscle-car sound.', 'Leather seats.|Premium trim with heated front seats.', 'Shaker audio.|A 500-watt stereo system.', 'Rear-wheel drive.|Old-school Mustang handling.'],
    about: ['American muscle at a price that is hard to beat. This Performance White GT Premium is the perfect weekend car or first V8.', 'Three owners and 89,000 miles with fresh fluids, tires and belts. The price drop of $1,000 makes it one of the best deals on our lot.'],
  },
  {
    name: '2011 BMW M3 Coupe', body: 'Coupe', category: 'sports-convertibles', fuel: 'gasoline', drive: 'rwd', color: 'white', miles: 66800, price: 39900,
    trans: '6-speed manual', engine: '4.0L S65 V8, 414 hp', economy: '15 MPG combined', interior: 'Fox red leather', owners: 2, badge: 'Just arrived', hit: true,
    features: ['4.0L high-revving V8.|414 hp and a redline above 8,000 rpm.', '6-speed manual.|The last M3 with a naturally aspirated V8.', 'Electronic dampers.|Comfort and sport settings.', 'Fox red leather.|The signature M3 interior.'],
    about: ['The E92 M3 is already a collectible: a high-revving V8 and a manual gearbox in one coupe. Alpine White with fox red leather, and rod bearings replaced as preventive maintenance.', 'Two owners, full BMW service records and 66,800 careful miles. A true enthusiast car.'],
  },
  {
    name: '1987 Porsche 911 Carrera', body: 'Coupe', category: 'sports-convertibles', fuel: 'gasoline', drive: 'rwd', color: 'red', miles: 92000, price: 74900,
    trans: '5-speed manual (G50)', engine: '3.2L air-cooled flat-six, 207 hp', economy: '19 MPG combined', interior: 'Black leather', owners: 4, badge: 'Just arrived', hit: true,
    features: ['Air-cooled flat-six.|The sound and feel of a classic 911.', 'G50 five-speed gearbox.|The preferred transmission of the 3.2 Carrera.', 'Original Guards Red paint.|Preserved with documented care.', 'Service records.|A thick binder from the Porsche specialist.'],
    about: ['A genuine 3.2 Carrera from the final years of the classic body style before the 964. Guards Red, black leather and 92,000 documented miles.', 'Four owners over 39 years, a recent engine service and a clean title. An analog sports car for people who love to drive.'],
  },
  {
    name: '2017 Mazda MX-5 Miata Club', body: 'Convertible', category: 'sports-convertibles', fuel: 'gasoline', drive: 'rwd', color: 'white', miles: 42600, price: 21900,
    trans: '6-speed manual', engine: '2.0L SKYACTIV-G 4-cylinder, 155 hp', economy: '29 MPG combined', interior: 'Black leatherette', owners: 2, badge: 'Great price',
    features: ['6-speed manual.|One of the best shifters in any car.', 'Bilstein dampers.|Sharp handling and a comfortable ride.', 'Limited-slip differential.|Better traction out of corners.', 'Soft top.|Opens with one hand in seconds.'],
    about: ['The Miata Club trim is the enthusiast\'s choice: Bilstein shocks, a limited-slip differential and a sport-tuned chassis. This car is white with a black top.', 'Two owners and 42,000 miles. A fun, easy and reliable weekend car for the canyon roads of the Front Range.'],
  },
  {
    name: '2019 Mazda MX-5 Miata RF Grand Touring', body: 'Convertible', category: 'sports-convertibles', fuel: 'gasoline', drive: 'rwd', color: 'white', miles: 23400, price: 29900,
    trans: '6-speed manual', engine: '2.0L SKYACTIV-G 4-cylinder, 181 hp', economy: '29 MPG combined', interior: 'Black leather', owners: 1, badge: 'One owner', hit: true,
    features: ['Power retractable hardtop.|Opens in 13 seconds, even at low speeds.', '6-speed manual.|One of the best shifters in any car.', 'Leather and heated seats.|Grand Touring comfort.', 'Bose audio.|With headrest speakers.'],
    about: ['The Miata RF is pure driving fun: light, balanced and fun even at legal speeds. The retractable hardtop gives it the quiet of a coupe and open-air motoring on a nice day.', 'One owner and only 23,400 miles, in Ceramic White. The ideal weekend car, or the daily driver you will never want to sell.'],
  },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const mi = (n: number) => `${n.toLocaleString('en-US')} mi`;

// cheapest listing: $8,900
export const kitchens = CARS.map((car, i) => {
  const nn = String(i + 1).padStart(2, '0');
  const year = car.name.slice(0, 4);
  const slug = slugify(car.name);
  const isEv = car.fuel === 'electric';
  const tagSlugs = [...(car.miles < 30000 ? ['low-mileage'] : []), ...(car.family ? ['family-friendly'] : [])];
  return {
    slug,
    name: car.name,
    categorySlug: car.category,
    gallery: [`car-${nn}.jpg`, `interior-0${((i + 1) % 4) + 1}.jpg`],
    price: car.price,
    oldPrice: car.oldPrice,
    dimensions: mi(car.miles),
    height: year,
    shortDesc: `${car.body} · ${FUEL_LABEL[car.fuel]} · ${DRIVE_LABEL[car.drive]} · ${mi(car.miles)}`,
    description: car.about.map((t) => p(t)),
    highlights: car.features.map((f) => {
      const [title, text] = f.split('|');
      return { title, text };
    }),
    style: car.fuel,
    facade: car.drive,
    color: car.color,
    badge: car.badge,
    isHit: Boolean(car.hit),
    specs: [
      { label: 'Year', value: year },
      { label: 'Mileage', value: mi(car.miles) },
      { label: 'Fuel', value: FUEL_LABEL[car.fuel] },
      { label: 'Drivetrain', value: DRIVE_LABEL[car.drive] },
      { label: 'Transmission', value: car.trans },
      { label: isEv ? 'Battery' : 'Engine', value: car.engine },
      { label: 'Exterior color', value: COLOR_LABEL[car.color] },
      { label: 'Interior', value: car.interior },
      { label: isEv ? 'Range' : 'MPG', value: car.economy },
      { label: 'Owners', value: String(car.owners) },
      { label: 'Stock #', value: `KM-${24100 + (i + 1) * 7}` },
    ],
    included: ['172-point inspection', 'Free vehicle history report', '7-day money-back guarantee', '12-month / 12,000-mile powertrain warranty'].map((text) => ({ text })),
    excluded: ['Taxes, title & registration', 'Extended protection plans'].map((text) => ({ text })),
    tagSlugs,
    legacyPath: `/inventory/${slug}/`,
  };
});

/* ---------- Customer stories ---------- */

export const projects = [
  { slug: 'maya-2021-subaru-outback', title: "Maya's 2021 Subaru Outback", chips: ['Wagon', 'AWD', 'Washington Park'], excerpt: 'A family of four needed a roomy all-weather car for ski weekends and a daily school run — and wanted to avoid a private sale.', specs: [{ label: 'Mileage', value: '37,400 mi' }, { label: 'Year', value: '2021' }], priceFrom: 31200, gallery: ['story-01.jpg'], description: [p('Maya was shopping for a car that could take two kids, a dog and a roof box to Winter Park every other weekend. She had looked at private sellers, but could not tell the good cars from the problem ones.'), p('She test-drove an Outback on Saturday morning, got pre-approved in two minutes and drove home the same afternoon. Her old crossover was valued on the spot and the trade-in bonus lowered her monthly payment.')] },
  { slug: 'carlos-2022-ford-f-150', title: "Carlos's 2022 Ford F-150", chips: ['Pickup', '4WD', 'Montbello'], excerpt: 'A contractor needed a dependable work truck without paying new-truck prices.', specs: [{ label: 'Mileage', value: '33,200 mi' }, { label: 'Year', value: '2022' }], priceFrom: 38900, gallery: ['story-02.jpg'], description: [p('Carlos runs a small landscaping crew and needs a truck that starts every morning. He wanted four-wheel drive, a tow package and a bed that had not been abused.'), p('Our technician walked him through the inspection report line by line. Carlos bought the truck, financed over 60 months at 6.4% APR and asked us to deliver it to his job site.')] },
  { slug: 'priya-2022-tesla-model-3', title: "Priya's 2022 Tesla Model 3", chips: ['Electric', 'AWD', 'Capitol Hill'], excerpt: 'First-time EV owner with no garage: how she planned charging before buying.', specs: [{ label: 'Mileage', value: '31,900 mi' }, { label: 'Year', value: '2022' }], priceFrom: 27400, gallery: ['story-03.jpg'], description: [p('Priya lives in an apartment on Capitol Hill and worried about charging. Before she committed, our finance manager mapped the chargers near her home and work and explained the battery health report.'), p('She chose a Model 3 Long Range, received our first-time buyer rate and got free home delivery. Six months later she says she has not stopped at a gas station once.')] },
  { slug: 'daniel-2020-toyota-camry-hybrid', title: "Daniel's 2020 Toyota Camry Hybrid", chips: ['Sedan', 'Hybrid', 'Aurora'], excerpt: 'A retired teacher wanted something simple, efficient and easy to get into.', specs: [{ label: 'Mileage', value: '47,900 mi' }, { label: 'Year', value: '2020' }], priceFrom: 24100, gallery: ['story-04.jpg'], description: [p('Daniel drove the same SUV for fifteen years and was ready for something smaller that cost less to run. He spent an afternoon with us and tried three cars.'), p('The Camry Hybrid was the quiet winner: 46 MPG, comfortable seats and a price that fit his budget after we agreed on a trade-in for the old SUV.')] },
  { slug: 'elena-2021-mazda-cx-5', title: "Elena's 2021 Mazda CX-5", chips: ['SUV', 'AWD', 'Stapleton'], excerpt: 'A young nurse chose a stylish crossover on a tight budget and was approved in minutes.', specs: [{ label: 'Mileage', value: '29,800 mi' }, { label: 'Year', value: '2021' }], priceFrom: 24800, gallery: ['story-05.jpg'], description: [p('Elena works night shifts at a hospital and wanted a safe, good-looking car. Her credit history was short, so she was worried about being turned down.'), p('We submitted her application to several lenders at once, found a 66-month plan with a monthly payment she liked and added the first-year maintenance offer. She picked up the car that evening.')] },
].map((pr) => ({
  ...pr,
  chips: pr.chips.map((text) => ({ text })),
  legacyPath: `/stories/${pr.slug}/`,
}));

/* ---------- Blog ---------- */

export const articleTags = [
  { slug: 'buying-tips', name: 'Buying tips' },
  { slug: 'financing', name: 'Financing' },
  { slug: 'electric', name: 'EV & hybrids' },
  { slug: 'ownership', name: 'Ownership & care' },
  { slug: 'trade-in', name: 'Trade-in' },
  { slug: 'stories', name: 'Customer stories' },
].map((t, i) => ({ ...t, order: i + 1 }));

/** Dealership team: shown on "About" (isTeam) and as article authors and reviewers */
export const authors = [
  { key: 'sales', name: 'Jordan Hale', role: 'Sales manager', isTeam: true, order: 1, text: 'Helps you find the right car for your budget and your commute. Shows the inspection report, runs the test drive and never works on pressure.' },
  { key: 'finance', name: 'Priya Natarajan', role: 'Finance manager', isTeam: true, order: 2, text: 'Compares offers from several lenders, explains APR and terms in plain English and gets you the lowest monthly payment that works.' },
  { key: 'tech', name: 'Luis Ortega', role: 'Lead technician', isTeam: true, order: 3, text: 'Leads the 172-point inspection: engine, brakes, suspension, electronics and body. A car goes on the lot only with his sign-off.' },
  { key: 'delivery', name: 'Hannah Brooks', role: 'Delivery coordinator', isTeam: true, order: 4, text: 'Schedules home deliveries along the Front Range, checks the final prep and hands over the keys at your door.' },
];

type DzComponent = { __component: string } & Record<string, unknown>;
const text = (body: Block[]): DzComponent => ({ __component: 'article.text', body });

const hybridContent: DzComponent[] = [
  text([
    p('The question we hear most in the showroom is not "which car?" but "which powertrain?". Gas, hybrid and electric cars can all be a great choice — it depends on how and where you drive.'),
    h(2, 'The three options in one minute'),
    p('Each type of powertrain has a different balance of purchase price, running costs and convenience.'),
    ul([
      ['Gasoline', 'the lowest purchase price and a fuel station on every corner; the easiest for road trips.'],
      ['Hybrid', 'a gas engine plus a small battery; 40+ MPG with no plugging in.'],
      ['Plug-in hybrid', 'a larger battery for 25–40 miles of electric driving, with a gas engine as a back-up.'],
      ['Electric', 'no fuel, little maintenance and instant torque; best if you can charge at home or at work.'],
    ]),
  ]),
  { __component: 'article.image', caption: 'Hybrid, electric and gas models from our Denver lot.', image: 'article-01.jpg' },
  text([
    h(2, 'Which one fits your commute'),
    p('Start with the miles you drive on a typical day, not the longest trip you take once a year.'),
    h(3, 'Under 40 miles a day'),
    p('An electric car covers the commute on one overnight charge, and you rarely need a public charger.'),
    h(3, 'Long highway commutes'),
    p('A hybrid is the safest bet: it saves most of the fuel and never asks you to plan a charging stop.'),
    h(2, 'What about Colorado winters and the mountains'),
    p('Cold weather reduces EV range by 20–30%, and climbing to the passes is hard on every battery. Plan for that in the numbers and choose an AWD car with some range to spare.'),
  ]),
  { __component: 'article.tip', title: "Technician's tip", text: 'Ask for a battery health report on any used hybrid or EV. At Kestrow Motors it is part of the 172-point inspection and included in every report.' },
  text([
    h(2, 'What to do if you cannot charge at home'),
    ul([
      'Check whether your workplace has chargers.',
      'Look for a fast charger within five minutes of your usual route.',
      'Consider a hybrid if neither option is realistic.',
    ]),
  ]),
  { __component: 'article.quote', text: 'The best powertrain is the one that fits your week, not the one that wins arguments.' },
  { __component: 'article.cta', title: 'Not sure which one to pick?', text: 'Tell us about your commute and budget. A sales consultant will line up three matching cars and a monthly payment for each.', buttonLabel: 'Find my car' },
  text([h(2, 'Cost comparison at a glance')]),
  {
    __component: 'article.table',
    rows: [
      ['', 'Gasoline', 'Hybrid', 'Electric'],
      ['Purchase price', 'Lowest', 'Medium', 'Higher'],
      ['Fuel or energy', '$$$', '$$', '$'],
      ['Maintenance', 'Standard', 'Standard', 'Lowest'],
      ['Best for', 'Road trips', 'Long commutes', 'Daily city driving'],
    ],
  },
  text([p('Use this as a starting point: the final cost of ownership also depends on insurance, tires and how long you keep the car.')]),
];

const article = (excerpt: string, paragraphs: string[]): DzComponent[] => [text([p(excerpt), ...paragraphs.map((t) => p(t))])];

const A = (slug: string, title: string, tagSlug: string, date: string, excerpt: string, cover: string, body: string[] = []) => ({
  slug,
  title,
  tagSlug,
  date,
  excerpt,
  cover,
  readingMinutes: 5,
  content: article(excerpt, body),
  authorKey: undefined as string | undefined,
  expertKey: undefined as string | undefined,
  lead: undefined as string | undefined,
});

export const articles = [
  {
    ...A('hybrid-vs-electric-vs-gas', 'Hybrid vs. electric vs. gas: what fits your commute', 'electric', '2026-10-12', 'We compare the three powertrains and explain which one fits which kind of driver.', 'article-01.jpg'),
    lead: 'Fuel type shapes both the price you pay and the way you live with a car. We go through the main options and explain how they behave day to day in Colorado.',
    readingMinutes: 7,
    authorKey: 'sales',
    expertKey: 'tech',
    content: hybridContent,
  },
  A('how-much-car-can-you-afford', 'How much car can you really afford?', 'financing', '2026-10-10', 'A simple rule of thumb for the price, the down payment and the monthly payment.', 'article-02.jpg', [
    'Start with the monthly budget, not the sticker price. A common guideline is that the total cost of the car — payment, insurance and fuel — should not exceed 15% of your take-home pay.',
    'Then work out the down payment. Putting 10–20% down lowers the interest you pay and protects you if the car loses value faster than the loan balance.',
  ]),
  A('pre-owned-vs-new', 'Pre-owned vs. new: where the real savings are', 'buying-tips', '2026-10-08', 'A two-year-old car has lost much of its depreciation and still has most of its life ahead.', 'article-03.jpg', [
    'A new car loses about 20% of its value in the first year. A well-kept two- or three-year-old model has already paid that bill, so you drive nearly the same car for far less.',
    'The catch is condition. That is why every Kestrow car goes through a 172-point inspection, and why you get the full report before you commit.',
  ]),
  A('trade-in-tips', 'How to get the most for your trade-in', 'trade-in', '2026-10-05', 'Five things to do before you bring your car for a valuation.', 'article-04.jpg', [
    'Wash the car and clear out the cabin. A clean car looks better cared for, and dealers price what they see. Gather the service records, both keys and the owner\'s manual.',
    'Get two or three offers, including one online. Our trade-in valuation takes about ten minutes and the offer is good for seven days, so you can compare without pressure.',
  ]),
  A('what-the-172-point-inspection-covers', 'What a 172-point inspection actually covers', 'buying-tips', '2026-10-01', 'A look inside our service center on the day a car arrives.', 'article-05.jpg', [
    'The car goes on the lift, and our technician works through the list: engine, transmission, brakes, suspension, tires, electronics and body. A road test follows.',
    'Anything that fails is repaired or replaced and then re-checked. Cars that cannot be brought up to our standard are sent to auction instead of to the lot.',
  ]),
  A('charging-an-ev-at-home', 'Charging an EV at home: what you need to know', 'electric', '2026-09-28', 'Outlets, chargers, installation costs and how to charge in an apartment.', 'article-06.jpg', [
    'Most owners charge overnight on a Level 2 charger. A 240-volt outlet or wall connector adds 25–35 miles of range per hour, enough to refill an empty battery while you sleep.',
    'If you live in an apartment, ask the property manager about shared chargers, and check for fast chargers near your commute. We help every EV buyer plan this before they sign.',
  ]),
  A('five-test-drive-tips', 'Five things to check on a test drive', 'buying-tips', '2026-09-24', 'How to use 30 minutes behind the wheel to really learn a car.', 'article-07.jpg', [
    'Drive the route you drive every day: surface streets, a highway on-ramp and a parking lot. Check visibility, seat comfort and how easy the infotainment is to use.',
    'Turn the radio off and listen for rattles. Test the brakes, the steering at low speed and the climate control. Bring the passengers who will sit in the back.',
  ]),
  A('winter-prep-colorado', 'Getting your car ready for a Colorado winter', 'ownership', '2026-09-20', 'Tires, battery, fluids and a short emergency kit.', 'article-08.jpg', [
    'Check your tires first: look for at least 5/32 inch of tread and consider winter tires if you drive in the mountains. Test the battery, replace worn wipers and top off washer fluid rated for low temperatures.',
    'Keep a small kit in the trunk: an ice scraper, a blanket, a flashlight, water and a phone charger. It weighs almost nothing and may save a long wait.',
  ]),
  A('how-apr-and-loan-term-work', 'How APR and loan term change your payment', 'financing', '2026-09-16', 'Why the cheapest monthly payment is not always the cheapest loan.', 'article-09.jpg', [
    'A longer term lowers the monthly payment but increases the total interest. For a $25,000 loan at 6%, going from 48 to 72 months saves about $150 a month but costs roughly $1,600 more overall.',
    'Ask for the total cost of the loan, not just the payment. Our finance manager shows both numbers side by side, with no fees added at the end.',
  ]),
  A('how-to-read-a-vehicle-history-report', 'How to read a vehicle history report', 'buying-tips', '2026-09-12', 'Accidents, owners, title brands and service records: what to look at first.', 'article-10.jpg', [
    'Start with the title: it should be clean. Then check the number of owners, the reported accidents and any odometer discrepancies. A single minor incident is not a deal-breaker if the repair was done well.',
    'A history report only shows what was reported, so use it together with an inspection. Every Kestrow car comes with a free report and the technician\'s notes.',
  ]),
  A('mayas-outback-story', 'Maya\'s Outback: how a family found the right wagon in one weekend', 'stories', '2026-09-08', 'A customer story from Washington Park.', 'article-11.jpg', [
    'Maya arrived on Saturday morning with a list: AWD, a roomy back seat and a budget of $32,000. By noon she had driven three cars, and by three she was pre-approved.',
    'She traded in her old crossover, picked the 2021 Outback Onyx XT and drove home before dinner. The next weekend, it was on its way to the ski slopes.',
  ]),
];

/* ---------- Marketing ---------- */

export const promos = [
  { slug: 'trade-in-bonus', title: '$1,000 trade-in bonus', shortText: 'Trade in any car and get $1,000 on top of its appraised value.', text: 'Bring your current car for a valuation and we will add a $1,000 bonus to the offer when you buy any car from our inventory. A sales consultant will explain the terms and put the bonus in writing.', kind: 'sale', isMain: true, image: 'car-01.jpg' },
  { slug: 'low-apr', title: '0.9% APR for 36 months on select cars', shortText: 'A very low rate on a hand-picked list of low-mileage cars.', text: 'Pick a car marked with the offer and finance it for 36 months at 0.9% APR for well-qualified buyers. Our finance manager checks your pre-approval and shows the exact monthly payment.', kind: 'sale', image: 'car-14.jpg' },
  { slug: 'free-maintenance', title: 'Free first-year maintenance', shortText: 'Oil changes and tire rotations for 12 months, on us.', text: 'Buy any pre-owned car this month and receive the first 12 months of scheduled oil changes and tire rotations at our service center at no cost.', kind: 'gift', image: 'car-11.jpg' },
  { slug: 'first-time-buyer', title: 'First-time buyer program', shortText: 'Special rates and a simple process if this is your first car.', text: 'No credit history? No problem. Our first-time buyer program offers a dedicated finance manager, a lower down payment and a guided process from test drive to keys.', kind: 'sale', image: 'car-12.jpg' },
  { slug: 'military-first-responders', title: '$500 off for military & first responders', shortText: 'Thank you for your service — here is $500 off any car.', text: 'Active-duty military, veterans, police, firefighters and EMS personnel receive $500 off the price of any car. Bring a valid ID to your test drive.', kind: 'sale', image: 'car-18.jpg' },
  { slug: 'free-home-delivery', title: 'Free home delivery within 100 miles', shortText: 'We bring your new car to your driveway, free of charge.', text: 'Buy online or at the showroom and we deliver the car to your home or office anywhere within 100 miles of Denver for free. Farther? We will give you a flat price.', kind: 'gift', image: 'car-25.jpg' },
  { slug: 'weekend-test-drive', title: 'Weekend test-drive bonus: free detailing', shortText: 'Take a test drive on Saturday or Sunday and get a free detail.', text: 'Test drive any car on a weekend and receive a free interior and exterior detail voucher, valid for your next service visit.', kind: 'gift', image: 'car-20.jpg' },
].map((pr, i) => ({ isMain: false, legacyPath: undefined as string | undefined, ...pr, order: i + 1 }));

/** Inspection areas: shown on the trade-in page as "What we look at" tiles */
export const materials = [
  ['engine-transmission', 'Engine & transmission', 'inspect-01.jpg'],
  ['brakes-suspension', 'Brakes & suspension', 'inspect-02.jpg'],
  ['tires-wheels', 'Tires & wheels', 'inspect-03.jpg'],
  ['electronics', 'Electronics', 'inspect-04.jpg'],
  ['interior', 'Interior', 'inspect-05.jpg'],
  ['body-paint', 'Body & paint', 'inspect-06.jpg'],
].map(([slug, title, image], i) => ({ slug, title, image, order: i + 1 }));

/** [name, car, place, text] */
const REVIEW_SEED: [string, string, string, string][] = [
  ['Alex', 'RAV4 Hybrid', 'Highlands', 'I walked in expecting the usual haggling and instead got one honest price and the full inspection report. Jordan answered every question and I drove home the same day.'],
  ['Marina', 'CR-V', 'Capitol Hill', 'The finance manager found me a better rate than my own bank offered. The paperwork took less than an hour, which I did not think was possible.'],
  ['Olivia', 'Outback', 'Washington Park', 'We needed a family car quickly. They held the Outback for us, delivered it to our door and the 7-day return window took all the stress out of the decision.'],
  ['Daniel', 'Model 3', 'Cherry Creek', 'First EV, lots of nerves. The team explained charging and battery health and even sent a map of nearby chargers. Six months in, no regrets.'],
  ['Anna', 'CX-5', 'Congress Park', 'Fair trade-in value, no games. They matched the number I got online and added the $1,000 bonus. I felt respected the whole time.'],
  ['Sean', 'F-150', 'Stapleton', 'Bought a truck for the business. The inspection report was thorough, and when I noticed a small squeak a week later they fixed it for free.'],
  ['Helen', 'Camry', 'Berkeley', 'Quiet, clean showroom and nobody hovering over me. I took the Camry on a long test drive, and bought it the next morning.'],
  ['Ivan', 'Golf GTI', 'Five Points', 'Hard to find a clean manual GTI. Kestrow had one, the price was fair and the car was exactly as described. Great experience.'],
  ['Natalie', 'GLC', 'LoDo', 'I live downtown and did the whole purchase online. They delivered the car with a full tank and walked me through the features in my parking garage.'],
  ['Paul', 'Mustang', 'Baker', 'Dream car at a price I could actually afford. The staff are real car people, and they showed me the maintenance records without being asked.'],
];

/** Reviews: written, with a source; every third one is linked to a listing from the inventory (no video testimonials in the demo) */
export const reviews = REVIEW_SEED.map(([name, car, place, reviewText], i) => {
  const source = (i % 2 ? 'google' : 'houzz') as 'google' | 'houzz';
  return {
    name,
    caption: `${name}'s ${car}`,
    text: reviewText,
    rating: 5,
    source,
    place,
    date: `2026-${String(10 - (i % 6)).padStart(2, '0')}-${String(3 + i * 2).padStart(2, '0')}`,
    kitchenSlug: i % 3 === 0 ? kitchens[[0, 10, 19, 24][i / 3]].slug : undefined,
    photo: undefined as string | undefined,
    showOnHome: i < 6,
    order: i + 1,
  };
});

const faq = (question: string, answer: string, groups: Group[]) => ({ question, answer, groups });

/** A question needed on several pages is stored as a separate record per group. */
export const faqs = [
  faq('Are your prices really no-haggle?', 'Yes. Every car has one transparent price that already reflects the market and our reconditioning costs. What you see is what you pay, plus taxes, title and registration.', ['home']),
  faq('How do I know the cars are in good shape?', 'Every car passes a 172-point inspection in our own service center, and you can read the full report and a free vehicle history report before you buy.', ['home']),
  faq('Can I buy a car if I am not from Colorado?', 'Yes. We sell to out-of-state buyers and arrange shipping. Taxes and registration follow the rules of your home state, and our team will walk you through the paperwork.', ['home', 'delivery']),
  faq('Can I trade in my current car?', 'Yes. Get a valuation online or bring your car to the showroom; the offer is good for seven days, whether you buy from us or not.', ['home', 'materials']),
  faq('What financing options are there?', 'We work with several lenders, so you get competing offers. Terms run 36–72 months, and you can get pre-approved in two minutes with a soft credit check.', ['home', 'payment']),
  faq('What if I change my mind after buying?', 'You have 7 days or 250 miles, whichever comes first, to return the car for a full refund under our money-back guarantee.', ['home', 'warranty']),
  faq('How do I claim the $1,000 trade-in bonus?', 'Leave a request on the site or call us. Bring the car you want to trade in; the bonus is added to the appraised value when you buy any car from our inventory.', ['offers']),
  faq('Can I combine several offers?', 'Some offers stack and some do not. The trade-in bonus can be combined with free delivery and the first-year maintenance gift; low-APR financing cannot be combined with a military or first-responder discount.', ['offers']),
  faq('Is there a minimum purchase price?', 'No. Most offers apply to every car in our inventory. Special APR is available on selected models listed on the offer page.', ['offers']),
  faq('When should I mention the offer I want to use?', 'Before you sign the paperwork, so that we can include the discount or the gift in your final price.', ['offers']),
  faq('How does the trade-in valuation work?', 'You tell us the year, make, model and mileage and send a few photos. We give you a preliminary number in minutes and confirm it after a short in-person inspection.', ['materials']),
  faq('Will you buy my car if I do not buy one from you?', 'Yes. The offer is yours for seven days even if you do not buy a car from us.', ['materials']),
  faq('What if I still owe money on my car?', 'We contact your lender, pay off the loan and add any positive equity to your down payment. If you owe more than the car is worth, we can roll the difference into the new loan.', ['materials']),
  faq('What happens at the appraisal?', 'A technician checks the engine, brakes, tires, electronics, interior and body, looks at the service history and takes a short test drive.', ['materials']),
  faq('What does the powertrain warranty cover?', 'Every car comes with a 12-month / 12,000-mile limited warranty on the engine, transmission and drive axles. You can extend it up to 5 years.', ['warranty']),
  faq('How do I make a claim?', 'Call us or send a message with a photo or a short video. We book you into our service center and our technicians review the issue.', ['warranty']),
  faq('Is the warranty transferable?', 'Yes. If you sell the car privately within the coverage period, the remaining warranty can be transferred for a small fee.', ['warranty']),
  faq('Do you offer extended protection plans?', 'Yes, from 2 to 5 years. Plans are optional and priced separately; a finance manager explains them without pressure.', ['warranty']),
  faq('What APR can I get?', 'APR starts from 5.9% for well-qualified buyers, depending on credit, term and down payment. Select cars have promotional rates as low as 0.9%.', ['payment']),
  faq('Will pre-approval affect my credit score?', 'No. Pre-approval uses a soft check, which does not impact your score. A hard check happens only when you decide to finance a car.', ['payment']),
  faq('Can I get financing with bad or no credit?', 'Often, yes. We work with lenders who specialise in first-time buyers and rebuilding credit. A larger down payment improves your terms.', ['payment']),
  faq('How much down payment do I need?', 'Many buyers put 10–20% down, but there is no fixed minimum. Your trade-in can serve as the down payment.', ['payment']),
  faq('How long is a test drive?', 'Usually 30–45 minutes. We will give you time on city streets and a highway so you can judge the car in real conditions.', ['measurement']),
  faq('Do I need an appointment?', 'Not required, but booking guarantees that the car is ready, washed and waiting for you at the showroom.', ['measurement']),
  faq('Can I take the car home overnight?', 'Overnight drives are available for qualified buyers on most cars. Ask your sales consultant.', ['measurement']),
  faq('What do I need to bring to a test drive?', 'A valid driver\'s license and proof of insurance. If you are trading in a car, bring that too.', ['measurement']),
  faq('Is delivery really free?', 'Yes. Delivery within 100 miles of Denver is free. For longer distances we quote a flat fee in advance.', ['delivery']),
  faq('Who brings the car and what happens at handover?', 'Our delivery coordinator brings the car, goes through the features with you and hands over the keys. You sign the final documents on a tablet.', ['delivery']),
  faq('Can I still return the car after delivery?', 'Yes. The 7-day money-back guarantee applies to delivered cars. We pick the car up from your door at no charge.', ['delivery']),
  faq('Can I reschedule the delivery?', 'Yes. Let us know a day ahead and we will find another time that works for you.', ['delivery']),
  faq('Do I need to be present at delivery?', 'You or an authorised person must be there to inspect the car and sign the documents.', ['delivery']),
  faq('How long does the inspection take?', 'Our technicians spend between three and five hours per car, depending on the model and its condition.', ['installation']),
  faq('Can I see the inspection report?', 'Yes. The full report with every checkpoint, photos and measurements is available for each car, and we can email it to you for free.', ['installation']),
  faq('What if a car fails the inspection?', 'We repair or replace the failed part with quality components and re-inspect. Cars that cannot meet our standard are not sold.', ['installation']),
  faq('Can I bring my own mechanic?', 'Of course. You are welcome to have an independent mechanic look at any car, at our shop or theirs.', ['installation']),
  faq('Are there any hidden fees?', 'No. The price you see is the price you pay, plus government taxes, title and registration. There are no documentation or dealer-prep fees.', ['installation']),
].flatMap((f) => f.groups.map((group) => ({ question: f.question, answer: f.answer, group })))
  .map((f, i) => ({ ...f, order: i + 1 }));

const stageGroup = (group: Group, list: [string, string?][]) =>
  list.map(([title, text], i) => ({ title, text, group, order: i + 1 }));

export const orderStages = [
  ...stageGroup('home', [
    ['Choose online', 'Browse the inventory, filter by budget and compare the cars you like.'],
    ['Test drive', 'Book a time, take the car for a spin and ask the consultant anything.'],
    ['Trade-in & financing', 'We value your current car and get you pre-approved in two minutes.'],
    ['Paperwork in under an hour', 'Sign digitally and pay the taxes, title and registration.'],
    ['Drive home or delivery', 'Take the keys at the showroom, or we deliver the car to your door.'],
  ]),
  ...stageGroup('kitchen', [['You pick a car and book a test drive'], ['We prepare the paperwork and your trade-in offer'], ['You choose financing or pay in full'], ['You drive home or we deliver']]),
  ...stageGroup('about', [
    ['Sourcing', 'We buy cars from trusted sources and decline most of them.'],
    ['Inspection', 'Every car goes through our 172-point inspection.'],
    ['Reconditioning', 'Technicians repair, replace and detail what is needed.'],
    ['Listing', 'Photos, the full report and a single transparent price go online.'],
    ['Delivery', 'You drive it home, or we bring the car to you.'],
  ]),
  ...stageGroup('materials', [['Tell us about your car'], ['Send a few photos'], ['Get a preliminary offer'], ['Confirm the value at the showroom']]),
  ...stageGroup('warranty', [['Contact Kestrow Motors'], ['Describe the issue'], ['Attach a photo or video'], ['Bring the car in and agree on the next steps']]),
  ...stageGroup('payment', [['Fill in a short form'], ['Get pre-approved with a soft check'], ['Compare offers from lenders'], ['Pick a term and sign']]),
  ...stageGroup('measurement', [['Choose a car and a time'], ['Meet your sales consultant'], ['Drive the car on your own route'], ['Decide with no pressure']]),
  ...stageGroup('delivery', [['The car is detailed and checked'], ['We agree on a date'], ['The car is delivered to your address'], ['You sign and keep the keys']]),
  ...stageGroup('installation', [['Arrival check'], ['Lift inspection'], ['Road test'], ['Repairs and final sign-off']]),
];

/* ---------- Forms (formId matches LeadForm on the front end) ---------- */

const NAME = { name: 'name', label: 'Your name', type: 'text', placeholder: 'Your name', required: false };
const PHONE = { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (___) ___-____', required: true };
const COMMENT = { name: 'comment', label: 'Comment', type: 'textarea', placeholder: 'Comment (optional)', required: false };
const FILE = { name: 'file', label: 'File or photo', type: 'file', required: false };
const WAY = { name: 'contactWay', label: 'Preferred way to reach you', type: 'radio', options: 'Phone call\nText message\nEmail', required: false };

/** CRM lead sources (crm.status.list, ENTITY_ID=SOURCE): CALLBACK — website form, REPEAT_SALE — website quiz */
const form = (
  formId: string,
  title: string,
  submitLabel: string,
  extra: Record<string, unknown>[] = [],
  crmSourceId = 'CALLBACK',
) => ({
  formId,
  title,
  submitLabel,
  crmTitle: `Website: ${title}`,
  crmSourceId,
  willSendToCrm: true,
  inputs: [NAME, PHONE, ...extra],
});

export const forms = [
  form('lead', 'Request (general)', 'Send request', [COMMENT, FILE, WAY]),
  form('promo', 'Claim the offer', 'Claim the offer'),
  form('quiz', 'Find your car quiz', 'Get my matches', [WAY], 'REPEAT_SALE'),
  form('zamer', 'Book a test drive', 'Book my test drive'),
  form('compare', "Beat a competitor's offer", 'Send me a better offer', [FILE, WAY]),
  form('catalog-photo', 'Car-finder request', 'Find this car for me', [FILE]),
  form('cheaper', 'Find a similar car for less', 'Show me cheaper options'),
  form('warranty', 'Warranty question', 'Ask a question', [COMMENT, FILE]),
  form('payment', 'Get pre-approved', 'Check my rate'),
  form('materials', 'Trade-in valuation', 'Value my car', [{ name: 'vehicle', label: 'Your current car', type: 'text', placeholder: 'Year, make, model, mileage', required: false }, COMMENT]),
  form('blog', 'Request from the blog', 'Get my offer'),
  form('checklist', 'Used-car buying checklist', 'Send me the checklist'),
  form('article', 'Request from an article', 'Find my car', [FILE]),
  form('contacts', 'Call back (contact page)', 'Call me back'),
  form('final', 'Final call to action', 'Get my offer'),
  form('promo-main', 'Main offer', 'Claim my $1,000 bonus'),
  form('promo-final', 'Price with offers applied', 'Check my price'),
  form('delivery', 'Home delivery question', 'Call me back', [{ name: 'address', label: 'Delivery address', type: 'text', placeholder: 'Delivery address (optional)', required: false }]),
  form('installation', 'Inspection report request', 'Send me the report'),
];

/* ---------- Single types ---------- */

export const setting = {
  siteName: 'Kestrow Motors',
  phone: '+1 (555) 013-2290',
  email: 'hello@kestrow.motors',
  address: '1180 Larkspur Avenue, Denver, CO 80204',
  socials: [
    { type: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/' },
    { type: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/' },
    { type: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/' },
    { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/15550132290' },
  ],
  reviewLinks: [],
  header: { tagline: 'Pre-owned cars, inspected and guaranteed', workHours: 'Mon–Sat, 9:00 am – 8:00 pm' },
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=1180+Larkspur+Avenue+Denver+CO+80204',
  // shared validity period of the offers: editors update it once a month
  promoPeriod: { startsAt: '2026-11-01', endsAt: '2026-11-30' },
  company: { legalName: 'Kestrow Motors LLC', registrationNumber: 'CO 2014-0071-1190', taxId: '84-0000000', legalAddress: '1180 Larkspur Avenue, Denver, CO 80204' },
  footer: { about: 'Hand-picked pre-owned and new cars, inspected in our own service center in Denver, Colorado', copyright: '© Kestrow Motors' },
  forms: {
    consentText: 'I agree to the processing of my personal data in accordance with the Privacy Policy',
    successTitle: 'Thank you! Your request has been sent.',
    successText: 'A Kestrow Motors consultant will get back to you shortly.',
    errorText: "We couldn't send your request. Please call us or try again.",
  },
};

export const topline = {
  enabled: true,
  text: '$1,000 trade-in bonus on every car purchased this month',
  linkLabel: 'Learn more',
  linkUrl: '/offers',
};

export const quiz = {
  title: 'Answer a few questions and find your car',
  steps: [
    ['body', 'Which body type do you prefer?', ['SUV', 'Sedan', 'Pickup truck', 'Hatchback or wagon', 'Sports car or convertible', 'Not sure yet']],
    ['budget', 'What budget do you have in mind?', ['Under $25,000', '$25,000–40,000', '$40,000–60,000', 'Over $60,000', 'Not sure yet']],
    ['fuel', 'Which fuel type interests you?', ['Gasoline', 'Hybrid', 'Plug-in hybrid', 'Electric', 'Open to anything']],
    ['seats', 'How many passengers do you usually carry?', ['Just me', '2', '3–4', '5 or more']],
    ['usage', 'How will you mostly drive?', ['City commute', 'Long highway trips', 'Family errands', 'Mountains and snow', 'Work and towing']],
    ['tradein', 'Do you have a car to trade in?', ['Yes', 'No', 'Maybe']],
    ['when', 'When do you plan to buy?', ['This week', 'Within a month', 'In 1–3 months', 'Just browsing']],
  ].map(([key, question, options]) => ({ key, question, options: (options as string[]).join('\n') })),
  finalTitle: 'Where should we send your matches and monthly payments?',
  finalText: 'We will pick the best matching cars from our inventory, calculate monthly payments and reserve your $1,000 trade-in bonus.',
  submitLabel: 'Get my matches',
};

/* ---------- Menus (strapi-plugin-navigation) ---------- */

/** Link to a record: [type, slug] — the seed resolves the documentId */
export type NavRef = ['page' | 'kitchen-category', string];

export type NavSeedItem = {
  title: string;
  /** INTERNAL — link to a record */
  ref?: NavRef;
  /** EXTERNAL — a path or URL (anchors, external sites) */
  href?: string;
  /** WRAPPER — group heading without a link */
  wrapper?: boolean;
  items?: NavSeedItem[];
};

const catalogItems: NavSeedItem[] = categories.map((c) => ({ title: c.name, ref: ['kitchen-category', c.slug] }));

const buyerItems: NavSeedItem[] = [
  { title: 'Test drive', ref: ['page', 'test-drive'] },
  { title: 'Trade-in', ref: ['page', 'trade-in'] },
  { title: 'Home delivery', ref: ['page', 'home-delivery'] },
  { title: '172-point inspection', ref: ['page', 'inspection'] },
  { title: 'Warranty', ref: ['page', 'warranty'] },
  { title: 'Financing', ref: ['page', 'financing'] },
];

export const navigations: { name: string; items: NavSeedItem[] }[] = [
  {
    name: 'Main',
    items: [
      { title: 'Cars', ref: ['page', 'cars'], items: catalogItems },
      { title: 'Offers', ref: ['page', 'offers'] },
      { title: "Buyer's guide", ref: ['page', 'guide'], items: buyerItems },
      {
        title: 'About',
        ref: ['page', 'about'],
        items: [
          { title: 'Inspection center', href: '/about#inspection-center' },
          { title: 'Team', href: '/about#team' },
          { title: 'Customer stories', ref: ['page', 'stories'] },
        ],
      },
      { title: 'Reviews', ref: ['page', 'reviews'] },
      { title: 'Blog', ref: ['page', 'blog'] },
      { title: 'Contact', ref: ['page', 'contact'] },
    ],
  },
  {
    name: 'Footer',
    items: [
      { title: 'Cars', wrapper: true, items: catalogItems },
      { title: "Buyer's guide", wrapper: true, items: [...buyerItems, { title: 'Offers', ref: ['page', 'offers'] }] },
      {
        title: 'Company',
        wrapper: true,
        items: [
          { title: 'About', ref: ['page', 'about'] },
          { title: 'Inspection center', href: '/about#inspection-center' },
          { title: 'Customer stories', ref: ['page', 'stories'] },
          { title: 'Reviews', ref: ['page', 'reviews'] },
          { title: 'Blog', ref: ['page', 'blog'] },
        ],
      },
    ],
  },
  {
    name: 'Legal',
    items: [
      { title: 'Privacy Policy', ref: ['page', 'privacy-policy'] },
      { title: 'Company details', href: '/contact#company' },
      { title: 'Image credits', href: '/credits' },
    ],
  },
];
