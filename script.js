const defaults=[
["Bakso Original","Makanan",15000,"🍲","Bakso sapi dengan kuah gurih."],
["Bakso Urat","Makanan",18000,"🍲","Bakso urat dengan kuah hangat."],
["Bakso Mercon","Makanan",20000,"🌶️","Bakso dengan isian pedas."],
["Bakso Komplit","Makanan",23000,"🍲","Bakso lengkap dengan mie, tahu, dan sayuran."],
["Mie Ayam","Makanan",13000,"🍜","Mie kenyal dengan ayam gurih."],
["Nasi Telur","Makanan",12000,"🍳","Nasi hangat dengan telur."],
["Tahu Crispy","Snack",10000,"🥟","Tahu renyah dan gurih."],
["Kentang Goreng","Snack",10000,"🍟","Kentang crispy."],
["Es Teh Manis","Minuman",5000,"🧋","Teh manis dingin."],
["Es Jeruk","Minuman",7000,"🍊","Jeruk segar."],
["Kopi Susu","Minuman",10000,"☕","Kopi susu creamy."],
["Air Mineral","Minuman",4000,"💧","Air mineral dingin."]
];
let menus=JSON.parse(localStorage.getItem("menus")||"null");
if(!menus){menus=defaults.map((x,i)=>({id:i+1,name:x[0],category:x[1],price:x[2],emoji:x[3],desc:x[4],image:""}));localStorage.setItem("menus",JSON.stringify(menus))}
else {menus=menus.filter(m=>m.category!=="Seblak"&&!/seblak/i.test(m.name));menus.forEach(m=>{if(m.image===undefined)m.image=""});localStorage.setItem("menus",JSON.stringify(menus))}
let cart=JSON.parse(localStorage.getItem("cart")||"[]"),cat="Semua";const rp=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
function render(){let q=document.getElementById("search").value.toLowerCase();document.getElementById("cats").innerHTML=["Semua",...new Set(menus.map(x=>x.category))].map(c=>`<button onclick="cat='${c}';render()">${c}</button>`).join("");document.getElementById("menus").innerHTML=menus.filter(m=>(cat=="Semua"||m.category==cat)&&m.name.toLowerCase().includes(q)).map(m=>`<article><div class="food">${m.image?`<img src="${m.image}" alt="${m.name}">`:m.emoji}</div><h3>${m.name}</h3><p>${m.desc}</p><b>${rp(m.price)}</b><button onclick="add(${m.id})">+ Tambah</button></article>`).join("")}
function add(id){let x=cart.find(i=>i.id==id);x?x.qty++:cart.push({id,qty:1});save();drawCart()}function change(id,d){let x=cart.find(i=>i.id==id);x.qty+=d;if(x.qty<1)cart=cart.filter(i=>i.id!=id);save();drawCart()}function clearCart(){cart=[];save();drawCart()}function save(){localStorage.setItem("cart",JSON.stringify(cart))}
function drawCart(){document.getElementById("cart").innerHTML=cart.length?cart.map(i=>{let m=menus.find(x=>x.id==i.id);return`<div class="cartrow"><span>${m.image?`<img src="${m.image}" style="width:42px;height:42px;object-fit:cover;border-radius:8px;vertical-align:middle">`:m.emoji} ${m.name}<br><small>${rp(m.price)} × ${i.qty}</small></span><span><button onclick="change(${m.id},-1)">−</button> ${i.qty} <button onclick="change(${m.id},1)">+</button></span></div>`}).join(""):"<p class='empty'>Keranjang masih kosong.</p>";let s=cart.reduce((a,i)=>a+menus.find(m=>m.id==i.id).price*i.qty,0),f=s?2000:0;document.getElementById("sub").textContent=rp(s);document.getElementById("fee").textContent=rp(f);document.getElementById("total").textContent=rp(s+f);document.getElementById("count").textContent=cart.reduce((a,i)=>a+i.qty,0)}
function order(e){e.preventDefault();if(!cart.length)return alert("Keranjang masih kosong.");let total=cart.reduce((a,i)=>a+menus.find(m=>m.id==i.id).price*i.qty,0)+2000,o={id:"BPM-"+Date.now().toString().slice(-6),name:name.value,phone:phone.value,address:address.value,pay:pay.value,total,items:cart.map(i=>{let m=menus.find(x=>x.id==i.id);return`${m.name} × ${i.qty}`}),date:new Date().toLocaleString("id-ID")};let os=JSON.parse(localStorage.getItem("orders")||"[]");os.unshift(o);localStorage.setItem("orders",JSON.stringify(os));alert("Pesanan berhasil!\nNo: "+o.id+"\nTotal: "+rp(total));cart=[];save();drawCart();e.target.reset()}render();drawCart();