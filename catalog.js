/* Shared catalog + helpers (loaded first on every page) */
const PX=(id,w=900)=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const POOL=[1191531,1458867,248077,265906,1454171,1721943,2735970,3266700,2697786,3641059,994234,1413420];
const CATEGORIES=['Earrings','Necklaces','Bracelets','Rings','Bangles'];
const EDITS=['The Coastal Edit','Adapt','Poise','Bridal Edit','Limited Edition','Resort'];
const METALS=['18k Gold Vermeil','Recycled Gold','Sterling Silver','Pearl & Gem'];
const NAMES={
  Earrings:[['Droplets Earrings','Dangle'],['Theos Earrings','Statement'],['Logos Earrings','Studs'],['Lebedus Earrings','Dangle'],['Liano Earrings','Statement'],['Flora Earrings','Studs'],['Einai Ear Cuff','Ear Cuff'],['Entelechy Hoops','Hoops'],['Halo Hoops','Hoops'],['Sculpted Hoops','Hoops'],['Pearl Studs','Studs'],['Aura Ear Cuff','Ear Cuff']],
  Necklaces:[['Coin Pendant','Pendants'],['Rope Chain Necklace','Chains'],['Aurelia Choker','Chokers'],['Layered Serpent Chain','Layering'],['Orbit Pendant','Pendants'],['Figaro Chain','Chains'],['Halo Collar','Chokers'],['Astra Statement Necklace','Statement'],['Pearl Strand','Layering'],['Cassia Pendant','Pendants'],['Sol Medallion','Statement']],
  Bracelets:[['Arith Bracelet','Chain'],['Link Bracelet','Chain'],['Wave Cuff','Cuffs'],['Charm Bracelet','Charm'],['Tennis Bracelet','Tennis'],['Serpent Cuff','Cuffs'],['Figaro Bracelet','Chain'],['Dune Cuff','Cuffs'],['Locket Charm Bracelet','Charm'],['Pearl Tennis Bracelet','Tennis'],['Rope Bracelet','Chain']],
  Rings:[['Batis Ring','Statement'],['Cassius Ring','Signet'],['Spiral Dome Ring','Statement'],['Signet Chain Ring','Signet'],['Stack Band I','Stackable'],['Stack Band II','Stackable'],['Slim Gold Band','Bands'],['Wave Band','Bands'],['Midi Knot Ring','Midi'],['Midi Pearl Ring','Midi'],['Braided Ring','Stackable'],['Molten Ring','Statement']],
  Bangles:[['Sculpted Bangle','Sculpted'],['Twist Bangle','Twisted'],['Hinged Bangle','Hinged'],['Organic Bangle','Sculpted'],['Rope Bangle','Twisted'],['Slim Hinged Bangle','Hinged'],['Wave Bangle','Sculpted'],['Braid Bangle','Twisted'],['Pearl Bangle','Hinged'],['Molten Bangle','Sculpted']]
};
const CATALOG=(()=>{
  const base={Earrings:90,Necklaces:140,Bracelets:120,Rings:95,Bangles:160},out=[];let i=0;
  CATEGORIES.forEach(cat=>NAMES[cat].forEach(([name,type])=>{
    const metal=/pearl/i.test(name)||i%7===3?METALS[3]:METALS[(i*2+(i>>2))%3];
    out.push({id:'v'+String(i+1).padStart(3,'0'),name,type,category:cat,metal,edit:EDITS[(i*5+(i>>2))%6],
      price:Math.round((base[cat]+((i*37)%14)*14)/5)*5,isBest:i%4===0||i%9===2,isNew:i%5===1||i%11===7,date:(i*13)%56,
      imgs:[POOL[(i*5)%12],POOL[(i*5+7)%12]]});
    i++;
  }));
  return out;
})();
const MAXPRICE=Math.ceil(Math.max(...CATALOG.map(p=>p.price))/50)*50;
function collURL(p){
  const u=new URLSearchParams();
  Object.entries(p||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')u.set(k,v)});
  const s=u.toString();return 'collection.html'+(s?'?'+s:'');
}
