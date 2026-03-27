let data = JSON.parse(localStorage.getItem('data')) || [];
let limits = JSON.parse(localStorage.getItem('limits')) || [];
let chart;

function autoCategory(text){
  text=text.toLowerCase();
  if(text.includes("coffee")||text.includes("burger")||text.includes("food")) return "Еда";
  if(text.includes("fuel")||text.includes("taxi")) return "Транспорт";
  if(text.includes("kaspi")||text.includes("credit")) return "Кредиты";
  if(text.includes("shop")) return "Покупки";
  return "Другое";
}

function save(){
  localStorage.setItem('data', JSON.stringify(data));
  localStorage.setItem('limits', JSON.stringify(limits));
}

function render(){
  let balance=0, spend=0, categories={};
  data.forEach(item=>{
    if(item.type==='income') balance+=item.amount;
    if(item.type==='expense'){balance-=item.amount; spend+=item.amount; categories[item.category]=(categories[item.category]||0)+item.amount;}
  });
  document.getElementById('balance').innerText="Баланс: "+balance;
  document.getElementById('capital').innerText=balance>0?"📈 Ты в плюсе":"📉 Ты в минусе";
  let day=new Date().getDate();
  let avg=day?spend/day:0;
  document.getElementById('forecast').innerText="Прогноз: "+Math.round(balance-(avg*(30-day)));
  let alerts="";
  limits.forEach(l=>{let used=categories[l.category]||0; if(used>l.amount) alerts+=`🚨 Перерасход: ${l.category}\n`;});
  document.getElementById('alerts').innerText=alerts;

  // Лимиты
  let div=document.getElementById('limits'); div.innerHTML='';
  limits.forEach(l=>{let el=document.createElement('div'); el.innerText=`${l.category}: ${l.amount}`; div.appendChild(el);});

  // История
  let tbody=document.getElementById('transactionTable').querySelector('tbody'); tbody.innerHTML='';
  data.forEach((item,index)=>{let row=document.createElement('tr'); row.innerHTML=`
    <td>${item.amount}</td>
    <td>${item.type==='income'?'Доход':'Расход'}</td>
    <td>${item.category}</td>
    <td><button onclick="editTransaction(${index})">Редактировать</button>
        <button onclick="deleteTransaction(${index})">Удалить</button></td>`; tbody.appendChild(row);});

  // График
  let ctx=document.getElementById('chart').getContext('2d');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{type:'pie', data:{labels:Object.keys(categories), datasets:[{data:Object.values(categories)}]}});
}

function add(){
  let amount=+document.getElementById('amount').value;
  let type=document.getElementById('type').value;
  let note=document.getElementById('note').value;
  if(!amount||amount<=0){alert("Введите сумму"); return;}
  let category=autoCategory(note);
  data.push({amount,type,category}); save(); render();
  document.getElementById('amount').value=''; document.getElementById('note').value='';
}

function addLimit(){
  let category=document.getElementById('limitCategory').value;
  let amount=+document.getElementById('limitAmount').value;
  if(!category||!amount){alert("Введите лимит"); return;}
  limits.push({category,amount}); save(); render();
  document.getElementById('limitCategory').value=''; document.getElementById('limitAmount').value='';
}

function editTransaction(index){
  let item=data[index]; document.getElementById('amount').value=item.amount; document.getElementById('type').value=item.type;
  document.getElementById('note').value=item.note||'';
  data.splice(index,1); save(); render();
}

function deleteTransaction(index){data.splice(index,1); save(); render();}
render();
