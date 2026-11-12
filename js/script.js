// Recursos interativos da Christmas Haven
const dinheiro = valor => valor.toLocaleString('pt-BR', {
  style:'currency',currency:'BRL'
}
);
// Catálogo: cria os cards a partir do array de 50 produtos.
function criarCard(p) {
  return `<article class="card"><img src="${p.imagem}" alt="${p.nome}" loading="lazy"><div class="card-info"><span class="tag-categoria">${p.categoria}</span><h3>${p.nome}</h3><p>${p.descricao}</p><strong class="preco">${dinheiro(p.preco)}</strong><div class="card-acoes"><button class="btn-card" data-adicionar="${p.id}">Adicionar</button><button class="btn-detalhe" data-detalhe="${p.id}">Detalhes</button></div></div></article>`
}
function mostrarProdutos(lista,alvo='lista-produtos') {
  const area=document.getElementById(alvo);
  if(area)area.innerHTML=lista.map(criarCard).join('')
}
const lista=document.getElementById('lista-produtos');
if(lista) {
  mostrarProdutos(produtos);
  const busca=document.getElementById('busca'),categoria=document.getElementById('categoria');
  function filtrar() {
    const termo=busca.value.toLowerCase();
    const cat=categoria.value;
    const resultado=produtos.filter(p=>p.nome.toLowerCase().includes(termo)&& (cat==='todas'||p.categoria===cat));
    mostrarProdutos(resultado);
    document.getElementById('contador').textContent=`Mostrando ${resultado.length} de ${produtos.length} produtos`;
    document.getElementById('mensagem-vazia').hidden=resultado.length!==0
  }
  busca.addEventListener('input',filtrar);
  categoria.addEventListener('change',filtrar)
}
const destaques=document.getElementById('destaques');
if(destaques)mostrarProdutos(produtos.filter(p=>p.destaque).slice(0,4),'destaques');
// Carrinho salvo no navegador.
let carrinho=JSON.parse(localStorage.getItem('christmasHavenCarrinho')||'[]');
function atualizarCarrinho() {
  const qtd=document.getElementById('qtd-carrinho'),total=document.getElementById('total-carrinho'),itens=document.getElementById('itens-carrinho');
  if(qtd)qtd.textContent=carrinho.length;
  if(total)total.textContent=dinheiro(carrinho.reduce((s,p)=>s+p.preco,0));
  if(itens)itens.textContent=carrinho.length?carrinho.map(p=>p.nome).join(' · '):'Adicione seus favoritos para montar sua sacola.';
  localStorage.setItem('christmasHavenCarrinho',JSON.stringify(carrinho))
}
atualizarCarrinho();
// Melodia instrumental natalina original, gerada no próprio navegador.
const btnMusica=document.getElementById('btn-musica');
const painelMusica=document.getElementById('painel-musica');
const btnSilenciar=document.getElementById('btn-silenciar');
const btnFecharMusica=document.getElementById('btn-fechar-musica');
const btnPausarMusica=document.getElementById('btn-pausar-musica');
let contextoNatal=null, ganhoNatal=null, intervaloNatal=null, notaNatal=0;
let musicaTocando=false, musicaSilenciada=false;
const melodiaNatal=[659.25,659.25,659.25,0,659.25,659.25,659.25,0,659.25,783.99,523.25,587.33,659.25,0,698.46,698.46,698.46,698.46,698.46,659.25,659.25,659.25,659.25,587.33,587.33,659.25,587.33,0,783.99];
function prepararAudioNatal() {
  if(contextoNatal)return;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;
  contextoNatal=new AudioCtx();
  ganhoNatal=contextoNatal.createGain();
  ganhoNatal.gain.value=musicaSilenciada?0:.16;
  ganhoNatal.connect(contextoNatal.destination);
}
function tocarNotaNatal(frequencia) {
  if(!frequencia||!contextoNatal||!ganhoNatal)return;
  const oscilador=contextoNatal.createOscillator();
  const volume=contextoNatal.createGain();
  oscilador.type='sine';
  oscilador.frequency.value=frequencia;
  volume.gain.setValueAtTime(.0001,contextoNatal.currentTime);
  volume.gain.exponentialRampToValueAtTime(.22,contextoNatal.currentTime+.025);
  volume.gain.exponentialRampToValueAtTime(.0001,contextoNatal.currentTime+.32);
  oscilador.connect(volume);
  volume.connect(ganhoNatal);
  oscilador.start();
  oscilador.stop(contextoNatal.currentTime+.34);
}
function avancarMelodiaNatal() {
  tocarNotaNatal(melodiaNatal[notaNatal]);
  notaNatal=(notaNatal+1)%melodiaNatal.length;
}
async function iniciarMusicaNatal() {
  prepararAudioNatal();
  if(!contextoNatal)return;
  await contextoNatal.resume();
  if(intervaloNatal)clearInterval(intervaloNatal);
  musicaTocando=true;
  avancarMelodiaNatal();
  intervaloNatal=setInterval(avancarMelodiaNatal,360);
  if(btnPausarMusica)btnPausarMusica.textContent='Pausar';
  if(btnMusica)btnMusica.textContent='♫ Fechar';
}
function pausarMusicaNatal() {
  if(intervaloNatal)clearInterval(intervaloNatal);
  intervaloNatal=null;
  musicaTocando=false;
  if(contextoNatal)contextoNatal.suspend();
  if(btnPausarMusica)btnPausarMusica.textContent='Continuar';
  if(btnMusica)btnMusica.textContent='♫ Música';
}
function fecharMusicaNatal() {
  pausarMusicaNatal();
  if(painelMusica)painelMusica.hidden=true;
  if(btnMusica)btnMusica.setAttribute('aria-expanded','false');
}
if(btnMusica&&painelMusica)btnMusica.addEventListener('click',()=> {
  if(painelMusica.hidden) {
    painelMusica.hidden=false;
    btnMusica.setAttribute('aria-expanded','true');
    iniciarMusicaNatal();
  } else fecharMusicaNatal();
});
if(btnFecharMusica)btnFecharMusica.addEventListener('click',fecharMusicaNatal);
if(btnPausarMusica)btnPausarMusica.addEventListener('click',()=>musicaTocando?pausarMusicaNatal():iniciarMusicaNatal());
if(btnSilenciar)btnSilenciar.addEventListener('click',()=> {
  musicaSilenciada=!musicaSilenciada;
  if(ganhoNatal)ganhoNatal.gain.setTargetAtTime(musicaSilenciada?0:.16,contextoNatal.currentTime,.03);
  btnSilenciar.textContent=musicaSilenciada?'Ativar':'Mudo';
});
// Efeito sonoro curto para as ações da sacola.
function sino() {
  try {
    const contexto=new (window.AudioContext||window.webkitAudioContext)(),osc=contexto.createOscillator(),gain=contexto.createGain();
    osc.frequency.value=1046.5;
    gain.gain.setValueAtTime(.04,contexto.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,contexto.currentTime+.18);
    osc.connect(gain);
    gain.connect(contexto.destination);
    osc.start();
    osc.stop(contexto.currentTime+.2)
  } catch(e) {
  }
}
// Eventos dos cards (catálogo e destaques): adicionar à sacola e abrir detalhes.
const modal=document.getElementById('modal');
function fecharModal() {
  modal.classList.remove('aberto');
  modal.setAttribute('aria-hidden','true')
}
function cliqueCard(e) {
  const add=e.target.closest('[data-adicionar]'),det=e.target.closest('[data-detalhe]');
  if(add) {
    carrinho.push(produtos.find(p=>p.id===Number(add.dataset.adicionar)));
    atualizarCarrinho();sino();
    add.textContent='Adicionado ✓';
    setTimeout(()=>add.textContent='Adicionar',1100)
  }
  if(det&&modal) {
    const p=produtos.find(x=>x.id===Number(det.dataset.detalhe));
    document.getElementById('modal-detalhe').innerHTML=`<img src="${p.imagem}" alt="${p.nome}"><span class="tag-categoria">${p.categoria}</span><h2>${p.nome}</h2><p>${p.descricao}</p><strong class="preco">${dinheiro(p.preco)}</strong>`;
    modal.classList.add('aberto');
    modal.setAttribute('aria-hidden','false')
  }
}
[lista,destaques].forEach(area=>area&&area.addEventListener('click',cliqueCard));
if(modal) {
  document.getElementById('fechar-modal').addEventListener('click',fecharModal);
  modal.addEventListener('click',e=>e.target===modal&&fecharModal())
}
const limpar=document.getElementById('limpar-carrinho');
if(limpar)limpar.addEventListener('click',()=> {
  carrinho=[];atualizarCarrinho()
}
);
// Slideshow/galeria com ampliação (lightbox).
const lightbox=document.getElementById('lightbox');
document.querySelectorAll('[data-foto]').forEach(el=>el.addEventListener('click',()=> {
  const img=document.getElementById('foto-ampliada');img.src=el.dataset.foto;img.alt=el.dataset.nome;lightbox.classList.add('aberto');lightbox.setAttribute('aria-hidden','false')
}
));
const fecharLight=document.getElementById('fechar-lightbox');
if(fecharLight)fecharLight.addEventListener('click',()=>lightbox.classList.remove('aberto'));
if(lightbox)lightbox.addEventListener('click',e=> {
  if(e.target===lightbox)lightbox.classList.remove('aberto')
}
);
// Contagem regressiva para 25 de dezembro.
function atualizarContagem() {
  const el=document.getElementById('contagem');
  if(!el)return;
  const agora=new Date();
  let natal=new Date(agora.getFullYear(),11,25);
  if(agora>natal)natal=new Date(agora.getFullYear()+1,11,25);
  const falta=natal-agora,d=Math.floor(falta/86400000),h=Math.floor(falta/3600000)%24,m=Math.floor(falta/60000)%60,s=Math.floor(falta/1000)%60;
  el.textContent=`${d} dias · ${h} horas · ${m} min · ${s} seg`
}
atualizarContagem();
setInterval(atualizarContagem,1000);
// Validação do formulário.
const formulario=document.getElementById('form-contato');
if(formulario)formulario.addEventListener('submit',e=> {
  e.preventDefault();const nome=document.getElementById('nome').value.trim(),email=document.getElementById('email').value.trim(),assunto=document.getElementById('assunto').value,mensagem=document.getElementById('mensagem').value.trim(),saida=document.getElementById('mensagem-form');if(!nome||!email||!assunto||!mensagem) {
    saida.textContent='Preencha todos os campos para continuar.';return
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    saida.textContent='Digite um e-mail válido.';return
  }
  saida.textContent=`Obrigado, ${nome}! Sua mensagem foi registrada (demonstração).`;formulario.reset()
}
);
// Menu responsivo, neve e botão voltar ao topo.
const btnMenu=document.querySelector('.btn-menu'),menu=document.querySelector('.menu');
if(btnMenu&&menu)btnMenu.addEventListener('click',()=>menu.classList.toggle('aberto'));
const neve=document.querySelector('.neve');
if(neve) {
  for(let i=0;i<24;i++) {
    const f=document.createElement('span');
    f.className='floco';
    f.textContent='❄';
    f.style.left=Math.random()*100+'%';
    f.style.animationDuration=(7+Math.random()*9)+'s';
    f.style.animationDelay=(-Math.random()*12)+'s';
    f.style.opacity=.3+Math.random()*.6;
    neve.appendChild(f)
  }
}
const topo=document.getElementById('topo');
window.addEventListener('scroll',()=> {
  if(topo)topo.style.display=window.scrollY>400?'block':'none';document.querySelectorAll('[data-velocidade]').forEach(el=>el.style.transform=`translateY(${window.scrollY*el.dataset.velocidade}px)`)
}
);
if(topo)topo.addEventListener('click',()=>window.scrollTo( {
  top:0,behavior:'smooth'
}
));
const observador=new IntersectionObserver(entradas=>entradas.forEach(e=> {
  if(e.isIntersecting)e.target.classList.add('visivel')
}
));
document.querySelectorAll('.revelar').forEach(el=>observador.observe(el));
// Slideshow automático com controles e indicadores.
const slides=document.querySelectorAll('.slide');
if(slides.length) {
  let slideAtual=0;
  const indicadores=document.getElementById('indicadores');
  slides.forEach((s,i)=> {
    const ponto=document.createElement('button');ponto.setAttribute('aria-label',`Ir para o slide ${i+1}`);ponto.addEventListener('click',()=>mostrarSlide(i));indicadores.appendChild(ponto)
  }
  );
  function mostrarSlide(i) {
    slides.forEach(s=>s.classList.remove('ativo'));
    indicadores.querySelectorAll('button').forEach(b=>b.classList.remove('ativo'));
    slideAtual=(i+slides.length)%slides.length;
    slides[slideAtual].classList.add('ativo');
    indicadores.children[slideAtual].classList.add('ativo')
  }
  document.getElementById('proximo').addEventListener('click',()=>mostrarSlide(slideAtual+1));
  document.getElementById('anterior').addEventListener('click',()=>mostrarSlide(slideAtual-1));
  mostrarSlide(0);
  setInterval(()=>mostrarSlide(slideAtual+1),5000)
}
