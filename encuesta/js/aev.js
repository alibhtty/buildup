var D,I,C,N,M,R,U,G,E;

function calculate() {
	var p1, p2, p3, p4, p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,p23,p24,p25,p26,p27,p28,p29,p30,p31,p32,p33,p34,p35,p36,p37,p38,total;
	var contadorLetras=1;
	var unicasLetras=[];
	var almacenadorVecesRepetidas=[];
	
	//-- 1ª pregunta -->
	if (document.getElementById('p1').checked==true) {p1='DCMG'}
		else{p1='  '} 

	console.log("p1 " + p1);

	//-- 2ª pregunta -->
	if (document.getElementById('p3').checked==true) {p2='M'}
		else{p2='  '}
		console.log("p2 " +p2);

	//-- 3ª pregunta -->
	if (document.getElementById('p5').checked==true) {p3='DIRU'}
		else{p3='  '}
	// console.log(p3);
	//-- 4ª pregunta -->
	if (document.getElementById('p7').checked==true) {p4='DI'}
		else{p4='  '}
	// console.log(p4);


	//-- 5ª pregunta -->
	if (document.getElementById('p9').checked==true) {p5='DICU'}
		else{p5='  '}


	if (document.getElementById('p11').checked==true) {p6='INUG'}
		else{p6='  '}


	if (document.getElementById('p13').checked==true) {p7='CMI'}
		else{p7='  '}

	if (document.getElementById('p15').checked==true) {p8='ICNG'}
		else{p8='  '}

	if (document.getElementById('p17').checked==true) {p9='U'}
		else{p9='  '}

	if (document.getElementById('p19').checked==true) {p10='DNR'}
		else{p10='  '}

	if (document.getElementById('p21').checked==true) {p11='CNG'}
		else{p11='  '}

	if (document.getElementById('p23').checked==true) {p12='M'}
		else{p12='  '}

	if (document.getElementById('p25').checked==true) {p13='D'}
		else{p13='  '}

	if (document.getElementById('p27').checked==true) {p14='CNMG'}
		else{p14='  '}

	if (document.getElementById('p29').checked==true) {p15='DIUGE'}
		else{p15='  '}

	if (document.getElementById('p31').checked==true) {p16='NG'}
		else{p16='  '}

	if (document.getElementById('p33').checked==true) {p17='IU'}
		else{p17='  '}


	if (document.getElementById('p35').checked==true) {p18='IN'}
		else{p18='  '}

	if (document.getElementById('p37').checked==true) {p19='G'}
		else{p19='  '}

	if (document.getElementById('p39').checked==true) {p20='DE'}
		else{p20='  '}

	if (document.getElementById('p41').checked==true) {p21='DGE'}
		else{p21='  '}


	if (document.getElementById('p43').checked==true) {p22='DC'}
		else{p22='  '}


	if (document.getElementById('p45').checked==true) {p23='NG'}
		else{p23='  '}


	if (document.getElementById('p47').checked==true) {p24='I'}
		else{p24='  '}
	


	if (document.getElementById('p49').checked==true) {p25='NE'}
		else{p25='  '}


	if (document.getElementById('p51').checked==true) {p26='MR'}
		else{p26='  '}


	if (document.getElementById('p53').checked==true) {p27='C'}
		else{p27='  '}


	if (document.getElementById('p55').checked==true) {p28='DNG'}
		else{p28='  '}


	if (document.getElementById('p57').checked==true) {p29='NMG'}
		else{p29='  '}



	if (document.getElementById('p59').checked==true) {p30='DIM'}
		else{p30='  '}



	if (document.getElementById('p61').checked==true) {p31='DIR'}
		else{p31='  '}



	if (document.getElementById('p63').checked==true) {p32='UE'}
		else{p32='  '}


	if (document.getElementById('p65').checked==true) {p33='DN'}
		else{p33='  '}


	if (document.getElementById('p67').checked==true) {p34='ING'}
		else{p34='  '}


	if (document.getElementById('p69').checked==true) {p35='ICME'}
		else{p35='  '}



	if (document.getElementById('p71').checked==true) {p36='R'}
		else{p36='  '}


	if (document.getElementById('p73').checked==true) {p37='IUG'}
		else{p37='  '}


	if (document.getElementById('p75').checked==true) {
		p38='ING'
	}else{
		p38='  '
	}
	total=p1+p2+p3+p4+p5+p6+p7+p8+p9+p10+p11+p12+p13+p14+p15+p16+p17+p18+p19+p20+p21+p22+p23+p24+p25+p26+p27+p28+p29+p30+p31+p32+p33+p34+p35+p36+p37+p38;
	
	console.log('todal: ' + total)

	total= total.toUpperCase().replace(/ /g, "").split("").sort();
	
	console.log('todal: ' + total)

	//console.log(total);

	if(total.length != 0){
		for(let i =0;i<total.length;i++){
			if(total[i +1]===total[i]){
				contadorLetras++;
			}else{
				unicasLetras.push(total[i]);
				almacenadorVecesRepetidas.push(contadorLetras);
				contadorLetras=1;
			} 
		}
	}else{
		
	}
	

	console.log('unicasLetras: ' + unicasLetras);
	console.log('unicasLetraslength: ' + unicasLetras.length);
	console.log('almacenadorVecesRepetidas ' + almacenadorVecesRepetidas);

	

	for (let i =0; i< unicasLetras.length;i ++) {
		console.log("aqui tampoco")
		/*VAIRABLE DIGESTION*/
		// if ( unicasLetras[i].includes( '' )) {D="Llene la Encuesta"}
		// else
		if (unicasLetras[i]==="D" && almacenadorVecesRepetidas[i]>=6 ) {

			D="Mala Salud"
		}else if (unicasLetras[i]==="D" && almacenadorVecesRepetidas[i]>=4 ) {
			D="Salud Regular"
		}else if (unicasLetras[i]==="D" && almacenadorVecesRepetidas[i]>=2 ) {
			D="Buena Salud"
		}else if (unicasLetras[i]==="D" && almacenadorVecesRepetidas[i]>=0 ) {
			D="Muy Buena Salud"
		} 
		// console.log(D); 


		/*VAIRABLE INTESTINAL*/
		if (unicasLetras[i]==="I" && almacenadorVecesRepetidas[i]>=6 ) {

			I="Mala Salud"
		}else if (unicasLetras[i]==="I" && almacenadorVecesRepetidas[i]>=4 ) {
			I="Salud Regular"
		}else if (unicasLetras[i]==="I" && almacenadorVecesRepetidas[i]>=2 ) {
			I="Buena Salud"
		}else if (unicasLetras[i]==="I" && almacenadorVecesRepetidas[i]<=1 ) {
			I="Muy Buena Salud"
		}


		/*VAIRABLE CIRCULATORIO*/
		if (unicasLetras[i]==="C" && almacenadorVecesRepetidas[i]>=6 ) {

			C="Mala Salud"
		}else if (unicasLetras[i]==="C" && almacenadorVecesRepetidas[i]>=4 ) {
			C="Salud Regular"
		}else if (unicasLetras[i]==="C" && almacenadorVecesRepetidas[i]>=2 ) {
			C="Buena Salud"
		}else if (unicasLetras[i]==="C" && almacenadorVecesRepetidas[i]<=1 ) {
			C="Muy Buena Salud"
		}


			/*VAIRABLE NERVIOSO*/
		if (unicasLetras[i]==="N" && almacenadorVecesRepetidas[i]>=6 ) {

			N="Mala Salud"
		}else if (unicasLetras[i]==="N" && almacenadorVecesRepetidas[i]>=4 ) {
			N="Salud Regular"
		}else if (unicasLetras[i]==="N" && almacenadorVecesRepetidas[i]>=2 ) {
			N="Buena Salud"
		}else if (unicasLetras[i]==="N" && almacenadorVecesRepetidas[i]<=1 ) {
			N="Muy Buena Salud"
		}


		/*VAIRABLE INMUNOLOGICO*/
		if (unicasLetras[i]==="M" && almacenadorVecesRepetidas[i]>=6 ) {

			M="Mala Salud"
		}else if (unicasLetras[i]==="M" && almacenadorVecesRepetidas[i]>=4 ) {
			M="Salud Regular"
		}else if (unicasLetras[i]==="M" && almacenadorVecesRepetidas[i]>=2 ) {
			M="Buena Salud"
		}else if (unicasLetras[i]==="M" && almacenadorVecesRepetidas[i]<=1 ) {
			M="Muy Buena Salud"
		}


		/*VAIRABLE RESPIRATORIO*/
		if (unicasLetras[i]==="R" && almacenadorVecesRepetidas[i]>=6 ) {

			R="Mala Salud"
		}else if (unicasLetras[i]==="R" && almacenadorVecesRepetidas[i]>=4 ) {
			R="Salud Regular"
		}else if (unicasLetras[i]==="R" && almacenadorVecesRepetidas[i]>=2 ) {
			R="Buena Salud"
		}else if (unicasLetras[i]==="R" && almacenadorVecesRepetidas[i]<=1 ) {
			R="Muy Buena Salud"
		}

	/*VAIRABLE URINARIO*/
		if (unicasLetras[i]==="U" && almacenadorVecesRepetidas[i]>=6 ) {

			U="Mala Salud"
		}else if (unicasLetras[i]==="U" && almacenadorVecesRepetidas[i]>=4 ) {
			U="Salud Regular"
		}else if (unicasLetras[i]==="U" && almacenadorVecesRepetidas[i]>=2 ) {
			U="Buena Salud"
		}else if (unicasLetras[i]==="U" && almacenadorVecesRepetidas[i]<=1 ) {
			U="Muy Buena Salud"
		}

	/*VAIRABLE GLANDULAR*/
		if (unicasLetras[i]==="G" && almacenadorVecesRepetidas[i]>=6 ) {

			G="Mala Salud"
		}else if (unicasLetras[i]==="G" && almacenadorVecesRepetidas[i]>=4 ) {
			G="Salud Regular"
		}else if (unicasLetras[i]==="G" && almacenadorVecesRepetidas[i]>=2 ) {
			G="Buena Salud"
		}else if (unicasLetras[i]==="G" && almacenadorVecesRepetidas[i]<=1 ) {
			G="Muy Buena Salud"
		}

		/*VAIRABLE RESPIRATORIO*/
		if (unicasLetras[i]==="E" && almacenadorVecesRepetidas[i]>=6 ) {

			E="Mala Salud"
		}else if (unicasLetras[i]==="E" && almacenadorVecesRepetidas[i]>=4 ) {
			E="Salud Regular"
		}else if (unicasLetras[i]==="E" && almacenadorVecesRepetidas[i]>=2 ) {
			E="Buena Salud"
		}else if (unicasLetras[i]==="E" && almacenadorVecesRepetidas[i]<=1 ) {
			E="Muy Buena Salud"
		}

	}

	// console.log(D);


	document.getElementById('resultadoD').innerHTML=D;
	document.getElementById('resultadoI').innerHTML=I;
	document.getElementById('resultadoC').innerHTML=C;
	document.getElementById('resultadoN').innerHTML=N;
	document.getElementById('resultadoM').innerHTML=M;
	document.getElementById('resultadoR').innerHTML=R;
	document.getElementById('resultadoU').innerHTML=U;
	document.getElementById('resultadoG').innerHTML=G;
	document.getElementById('resultadoE').innerHTML=E;

	

}


// PROGRESS

// Estilo a números y barra de progreso

let form = document.getElementById('formulario');
let linearProgressBar = document.getElementById('prrogress-bar');
let progressBar = document.querySelector('.circular-progress');
let valueContainer = document.querySelector('.value-container');
let linearValueContainer = document.querySelector('.linear-value-container');
let answerCounter = 0;

form.addEventListener('click', (event)=>{
	if(event.target.type == 'radio'){
		let actualNumber = event.target.offsetParent.childNodes['1'];
		actualNumber.style.backgroundColor = '#F68B32';
		actualNumber.innerHTML = `<img class="check" src="./img/check.png" alt="check">`
		answerCounter = document.querySelectorAll('.check');
		increaseProgressBar(answerCounter.length)
	}
});

function increaseProgressBar(answerCounter){
	let porcentage = Math.floor((100 * answerCounter) / 38);
	valueContainer.innerHTML = `${porcentage}<span>%</span>`
	progressBar.style.background = `conic-gradient(#F68B32 ${porcentage*3.6}deg, #CACECF ${porcentage*3.6}deg)`;
	linearProgressBar.value = porcentage
	linearValueContainer.innerHTML = `${porcentage}<span>%</span>`
}

valueContainer.innerHTML = `${answerCounter}<span> %</span>`


// Modal de resultado
let resultBtn = document.getElementById('resultBtn');
let accepResultBtn = document.getElementById("accepResultBtn");

resultBtn.addEventListener('click', ()=>{
	if(answerCounter.length == 38){
		calculate();
	}else{
		let resultModal = document.getElementById('resultModal');
		resultModal.style.display = "block";
	}
});


accepResultBtn.addEventListener('click', ()=>{
	resultModal.style.display = "none";
});

// Modal Exportar
let exportBtn = document.getElementById('exportBtn');
exportBtn.addEventListener('click', ()=>{
	if(answerCounter.length == 38){
		exportarPDF()
	}else{
		let resultModal = document.getElementById('resultModal');
		resultModal.style.display = "block";
	}
});


// Imprimir PDF

function exportarPDF(){
	
	//creo un nuevo documento PDF:

	const doc = new jsPDF();

	//Agrego una imagen:
	
	let imgData = "data:image/jpeg;base64,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";
	doc.addImage(imgData, 'JPEG', 20, 10, 50, 13);

	//ANALISIS DE ESTILO DE VIDA
	doc.text('ANALISIS DE ESTILO DE VIDA', 110, 20);

	//RESULTADOS
	doc.text('RESULTADOS:', 20, 40);

	//Agrego texto con variables
	doc.text(`Digestivo: ${D}`, 20, 60);
	doc.text(`Intestinal: ${I}`, 20, 70);
	doc.text(`Circulatorio: ${C}`, 20, 80);
	doc.text(`Nervioso: ${N}`, 20, 90);
	doc.text(`Inmunológico: ${M}`, 20, 100);
	doc.text(`Respiratorio: ${R}`, 20, 110);
	doc.text(`Urinario: ${U}`, 20, 120);
	doc.text(`Glandular: ${G}`, 20, 130);
	doc.text(`Estructural: ${E}`, 20, 140);

	//Fecha
	let actualDate = new Date()
	let months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
	let dateString = `${actualDate.getDate()}/${months[actualDate.getMonth()]}/${actualDate.getFullYear()}`

	doc.setFontSize(10)
	doc.text(`Fecha: ${dateString}`, 150, 170);

	//Guardo documento
	doc.save("Natures_Sunshine_Report.pdf");
}