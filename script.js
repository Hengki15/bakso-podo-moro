const SUPABASE_URL='https://opjbjvauridhhfoqyxmq.supabase.co';
const SUPABASE_KEY='sb_publishable_SEsM7VAb5ZFVJNpnNAxUOg_BjMDNlBc';
const API=SUPABASE_URL+'/rest/v1';
const headers={apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'};
let menus=[],cart=JSON.parse(localStorage.getItem('cart')||'[]'),cat='Semua';
const rp=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
async function loadMenus(){
  try{
    const r=await fetch(API+'/menus?select=*&order=id.asc',{headers});
    if(!r.ok) throw new Error(await r.text());
    menus=await r.json();
    menus=menus.filter(m=>m.category!=='Seblak'&&!/seblak/i.test(m.name));
    render();drawCart();
  }catch(e){console.error(e);document.getElementById('menus').innerHTML='<p class="empty">Menu belum dapat dimuat. Periksa koneksi Supabase.</p>';}
}
function render(){let q=document.getElementById('search').value.toLowerCase();document.getElementById('cats').innerHTML=['Semua',...new Set(menus.map(x=>x.category).filter(Boolean))].map(c=>`<button onclick="cat='${String(c).replace(/'/g,"\\'")}';render()">${c}</button>`).join('');document.getElementById('menus').innerHTML=menus.filter(m=>(cat=='Semua'||m.category==cat)&&m.name.toLowerCase().includes(q)).map(m=>`<article><div class="food">${m.image_url?`<img src="${m.image_url}" alt="${m.name}">`:m.emoji||'🍲'}</div><h3>${m.name}</h3><p>${m.description||''}</p><b>${rp(m.price)}</b><button onclick="add(${m.id})">+ Tambah</button></article>`).join('')||'<p class="empty">Menu tidak ditemukan.</p>'}
function add(id){let x=cart.find(i=>i.id==id);x?x.qty++:cart.push({id,qty:1});save();drawCart()}
function change(id,d){let x=cart.find(i=>i.id==id);if(!x)return;x.qty+=d;if(x.qty<1)cart=cart.filter(i=>i.id!=id);save();drawCart()}
function clearCart(){cart=[];save();drawCart()}
function save(){localStorage.setItem('cart',JSON.stringify(cart))}
function drawCart(){document.getElementById('cart').innerHTML=cart.length?cart.map(i=>{let m=menus.find(x=>x.id==i.id);if(!m)return '';return`<div class="cartrow"><span>${m.image_url?`<img src="${m.image_url}" style="width:42px;height:42px;object-fit:cover;border-radius:8px;vertical-align:middle">`:m.emoji||'🍲'} ${m.name}<br><small>${rp(m.price)} × ${i.qty}</small></span><span><button onclick="change(${m.id},-1)">−</button> ${i.qty} <button onclick="change(${m.id},1)">+</button></span></div>`}).join(''):'<p class="empty">Keranjang masih kosong.</p>';let s=cart.reduce((a,i)=>{let m=menus.find(x=>x.id==i.id);return a+(m?Number(m.price)*i.qty:0)},0),f=s?2000:0;document.getElementById('sub').textContent=rp(s);document.getElementById('fee').textContent=rp(f);document.getElementById('total').textContent=rp(s+f);document.getElementById('count').textContent=cart.reduce((a,i)=>a+i.qty,0)}
async function order(e){e.preventDefault();if(!cart.length)return alert('Keranjang masih kosong.');let total=cart.reduce((a,i)=>{let m=menus.find(x=>x.id==i.id);return a+(m?Number(m.price)*i.qty:0)},0)+2000;let payload={customer_name:document.getElementById('name').value,phone:document.getElementById('phone').value,address:document.getElementById('address').value,payment_method:document.getElementById('pay').value,total,status:'Menunggu'};try{let r=await fetch(API+'/orders?select=id',{method:'POST',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(await r.text());let created=await r.json();let orderId=created[0].id;let items=cart.map(i=>{let m=menus.find(x=>x.id==i.id);return{order_id:orderId,menu_id:m.id,menu_name:m.name,quantity:i.qty,price:Number(m.price),subtotal:Number(m.price)*i.qty}});let r2=await fetch(API+'/order_items',{method:'POST',headers,body:JSON.stringify(items)});if(!r2.ok)throw new Error(await r2.text());alert('Pesanan berhasil!\nNo pesanan: BPM-'+String(orderId).padStart(6,'0')+'\nTotal: '+rp(total));cart=[];save();drawCart();e.target.reset()}catch(err){console.error(err);alert('Pesanan gagal disimpan. Pastikan tabel dan policy Supabase sudah dibuat.')}}
loadMenus();drawCart();
