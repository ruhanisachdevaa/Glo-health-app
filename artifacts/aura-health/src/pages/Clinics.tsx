import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Star, Search, ChevronDown } from "lucide-react";

const CITIES: Record<string, { name: string; clinics: Clinic[] }> = {
  london: {
    name: "London",
    clinics: [
      { id: 1, name: "The Lister Hospital – Women's Health", address: "Chelsea Bridge Rd, London SW1W 8RH", phone: "020 7730 7733", type: "PCOS/Endometriosis Specialist", rating: 4.8, reviews: 312, hours: "Mon–Fri: 8am–6pm", waitTime: "~3 days", nhs: false },
      { id: 2, name: "University College Hospital", address: "235 Euston Rd, London NW1 2BU", phone: "020 3456 7890", type: "Gynaecology & Hormonal Health", rating: 4.6, reviews: 891, hours: "Mon–Fri: 9am–5pm", waitTime: "~2 weeks (NHS)", nhs: true },
      { id: 3, name: "The Gynae Centre", address: "25 Harley St, London W1G 9QW", phone: "020 7580 8090", type: "Menstrual & Fertility Clinic", rating: 4.9, reviews: 204, hours: "Mon–Sat: 8am–7pm", waitTime: "~2 days", nhs: false },
      { id: 4, name: "King's College Hospital NHS", address: "Denmark Hill, London SE5 9RS", phone: "020 3299 9000", type: "PCOS & Reproductive Medicine", rating: 4.5, reviews: 1200, hours: "Mon–Fri: 8am–5pm", waitTime: "~3 weeks (NHS)", nhs: true },
    ]
  },
  manchester: {
    name: "Manchester",
    clinics: [
      { id: 5, name: "Manchester University NHS FT", address: "Oxford Rd, Manchester M13 9WL", phone: "0161 276 1234", type: "Women's & Hormonal Health", rating: 4.5, reviews: 678, hours: "Mon–Fri: 8am–5pm", waitTime: "~2 weeks", nhs: true },
      { id: 6, name: "Spire Manchester Hospital", address: "170 Barlow Moor Rd, Manchester M20 2AF", phone: "0161 447 6700", type: "PCOS & Gynaecology", rating: 4.7, reviews: 234, hours: "Mon–Sat: 8am–6pm", waitTime: "~4 days", nhs: false },
      { id: 7, name: "The Peel Medical Centre", address: "Peel House, Eccles, Manchester M30 0NU", phone: "0161 789 5566", type: "General Women's Health", rating: 4.3, reviews: 156, hours: "Mon–Fri: 9am–5pm", waitTime: "~1 week", nhs: true },
    ]
  },
  birmingham: {
    name: "Birmingham",
    clinics: [
      { id: 8, name: "Birmingham Women's Hospital NHS", address: "Mindelsohn Way, Birmingham B15 2TG", phone: "0121 472 1377", type: "Complete Women's Health", rating: 4.6, reviews: 940, hours: "Mon–Fri: 8am–5pm", waitTime: "~3 weeks", nhs: true },
      { id: 9, name: "Spire Parkway Hospital", address: "1 Damson Pkwy, Solihull B91 2PP", phone: "0121 704 1451", type: "PCOS & Endocrinology", rating: 4.8, reviews: 188, hours: "Mon–Sat: 8am–6pm", waitTime: "~5 days", nhs: false },
    ]
  },
  edinburgh: {
    name: "Edinburgh",
    clinics: [
      { id: 10, name: "Royal Infirmary of Edinburgh", address: "51 Little France Crescent, Edinburgh EH16 4SA", phone: "0131 536 1000", type: "Gynaecology & PCOS Clinic", rating: 4.5, reviews: 520, hours: "Mon–Fri: 8am–5pm", waitTime: "~2 weeks", nhs: true },
      { id: 11, name: "Murrayfield Hospital", address: "122 Corstorphine Rd, Edinburgh EH12 6UD", phone: "0131 334 0363", type: "Women's Health Specialist", rating: 4.7, reviews: 167, hours: "Mon–Fri: 8am–6pm", waitTime: "~3 days", nhs: false },
    ]
  },
  bristol: {
    name: "Bristol",
    clinics: [
      { id: 12, name: "Bristol Royal Infirmary", address: "Marlborough St, Bristol BS2 8HW", phone: "0117 923 0000", type: "Women's & Reproductive Health", rating: 4.4, reviews: 612, hours: "Mon–Fri: 8am–5pm", waitTime: "~3 weeks", nhs: true },
      { id: 13, name: "Clifton Gynaecology", address: "The Priory, Clifton, Bristol BS8 1TX", phone: "0117 974 4472", type: "PCOS, PMDD & Hormonal Health", rating: 4.9, reviews: 98, hours: "Mon–Fri: 9am–5pm", waitTime: "~1 week", nhs: false },
    ]
  },
  leeds: {
    name: "Leeds",
    clinics: [
      { id: 14, name: "Leeds Teaching Hospitals NHS Trust", address: "Great George St, Leeds LS1 3EX", phone: "0113 243 2799", type: "Gynaecology & PCOS", rating: 4.4, reviews: 780, hours: "Mon–Fri: 8am–5pm", waitTime: "~2 weeks", nhs: true },
      { id: 15, name: "Nuffield Health Leeds Hospital", address: "2 Leighton St, Leeds LS1 3EB", phone: "0113 388 2000", type: "Women's Health & Fertility", rating: 4.7, reviews: 213, hours: "Mon–Sat: 8am–6pm", waitTime: "~4 days", nhs: false },
    ]
  },
};

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  type: string;
  rating: number;
  reviews: number;
  hours: string;
  waitTime: string;
  nhs: boolean;
}

export default function Clinics() {
  const [selectedCity, setSelectedCity] = useState<string>("london");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNhs, setFilterNhs] = useState<"all" | "nhs" | "private">("all");

  const cityData = CITIES[selectedCity];
  const filteredClinics = cityData.clinics.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterNhs === "all" || (filterNhs === "nhs" ? c.nhs : !c.nhs);
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <header>
        <h1 className="text-3xl font-bold font-serif mb-1" style={{ color: "#674D66" }}>Nearby Clinics</h1>
        <p className="text-muted-foreground">Find women's health specialists and PCOS clinics near you.</p>
      </header>

      {/* City Selector */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Select your city</label>
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border-2 text-base font-medium focus:outline-none bg-white cursor-pointer"
            style={{ borderColor: "#674D66", color: "#674D66" }}
          >
            {Object.entries(CITIES).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#674D66" }} />
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm bg-white focus:outline-none"
            style={{ borderColor: "#EBD6DC" }}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "nhs", "private"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterNhs(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2"
              style={filterNhs === f
                ? { background: "#674D66", color: "white", borderColor: "#674D66" }
                : { background: "white", color: "#674D66", borderColor: "#EBD6DC" }
              }
            >
              {f === "all" ? "All" : f === "nhs" ? "NHS" : "Private"}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground font-medium">
        {filteredClinics.length} clinic{filteredClinics.length !== 1 ? "s" : ""} in <strong>{cityData.name}</strong>
      </p>

      {/* Clinics List */}
      <div className="space-y-4">
        {filteredClinics.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No clinics match your search.</p>
          </div>
        ) : (
          filteredClinics.map((clinic, i) => (
            <motion.div
              key={clinic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "#EBD6DC" }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-lg" style={{ color: "#674D66" }}>{clinic.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${clinic.nhs ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {clinic.nhs ? "NHS" : "Private"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">{clinic.type}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={14} className="flex-shrink-0" style={{ color: "#674D66" }} />
                      <span className="truncate">{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} className="flex-shrink-0" style={{ color: "#674D66" }} />
                      <span>{clinic.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={14} className="flex-shrink-0" style={{ color: "#674D66" }} />
                      <span>{clinic.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star size={14} className="flex-shrink-0" style={{ color: "#674D66" }} />
                      <span>{clinic.rating} ({clinic.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground mb-1">Typical wait</p>
                  <p className="font-bold text-sm" style={{ color: "#674D66" }}>{clinic.waitTime}</p>
                  <button
                    className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}
                    onClick={() => window.open(`tel:${clinic.phone.replace(/\s/g, "")}`, "_self")}
                  >
                    Call Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
