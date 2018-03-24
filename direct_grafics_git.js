


javascript:c= 'Графики охвата и Аукцион на поиске Яндекс.Директа (c) SergeyLossev';




(()=>{
	var ccc='(c) SergeyLossev - <a href="https://goo.gl/7N7WyA" target="_blank">https://fb.com/LossevSergey</a>';
	var tr_rows=$('.b-group-phrase');

	if (!$(".highcharts_container").length) {
		$("<div id='container' class='highcharts_container'><h1 style='font-size: 20px'>"+c+"</h1><br/>"
		+"<p>Наведите курсор на поле ввода ставок ключевого слова</p>"
		+"<p>В открывшемся окне будет показан расклад по охвату и аукциону - в зависимости от выбранного режима (поиск/сеть)</p>"
		+"<p>Диаграммы интерактивны - можно быстро установить ставку, кликнув по точке на диаграмме. Если нужно вернуться к исходному значению, можно кликнуть в зеленую линию с исходным значением ставки. Введенное значение отображается красной линией</p>"
		+"<p>На графике для РСЯ охват указан в штуках (кликов/показов), а не процентах, а пунктирной линией обозначены участки, для которых нет данных (ниже минимальной известной ставки)</p>"
		+"<p>Диаграммы убираются с экрана автоматически - как только курсор выйдет за её пределы</p>"
		+"<p></p>"
		+ccc
		+"</div>").appendTo("body").css({top: (top_offset=25)+'px'});
		containers=$(".highcharts_container").css({
			position: 'fixed',
			zIndex	: '10000001',
			border	: "2px solid #000000",
			width	: '500px',
			left	: '25px',
			backgroundColor :'white',
			textAlign		:'center'
		}).on('mouseleave', ()=>{$(containers).hide();});
		$('p', containers).css({textAlign: 'justify'});
		$('p,h1', containers).css({margin: '20px'});
	}

	/*модель данных*/
	var data_model=$("div.b-phrases-list_platform_context>div.i-model,div.b-phrases-list_platform_default>div.i-model").map((i,x)=>JSON.parse(x.getAttribute('data-bem'))['i-model']['data']).toArray();

	/*если навели на инпут*/
	on = (q) => {
		/* флаг того, что выбран режим РСЯ */
		var rsya_selected=$('.b-campaign-platform-switcher__radio-button .radio-button__radio_checked_yes').hasClass('radio-button__radio_side_right');
		var parent_tr=q.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
		var idd=parent_tr.id.split('-')[1];
		var data_object=data_model.filter(x=>x.id==idd)[0].data;
		var dd=q, input_left_edge = dd.target.getClientRects()[0].left;
		var left_1=$(".b-phrase-key-words", parent_tr.parentElement).toArray().map(x=>x.getClientRects()[0].right).sort().reverse()[0]+10;

		tr_rows.css({border: "0px"});
		$(parent_tr).css({border: "2px solid #ff0000"});
		containers.css({
			'left'	: left_1,
			'width'	: input_left_edge-left_1-3
		});

		var subtitle={
			text	: ccc,
			useHTML	: true,
			style	: {fontSize: '9px'}
		};

		/*=========================================
		  Охват 
		=========================================*/
		if (rsya_selected) {

			containers.css({'height': 400});
			var series=[{
				name:'Показы',
				data: data_object.pokazometer_data.complete_list.map(x=>[x.cost/1e6, x.shows]),
			},{
				name:'Клики',
				data: data_object.pokazometer_data.complete_list.map(x=>[x.cost/1e6, x.clicks])
			}];

			/* Зона с недоступными данными по РСЯ */
			series.forEach(x=>{
				min_zone_dashed=x.data[0] && x.data[0][0];
				x.data.unshift([0,0]);
				x.animation = false;
				x.zoneAxis = 'x';
				x.zones	= [{
					value: min_zone_dashed,
					dashStyle: 'ShortDot',
				}]
			});

			var plotLines=[{
				value	: data_object.price_context,
				width	: 4,
				color	: '#00ff00',
				label	: {
					text 	: '<span title="Кликните по линии, чтобы вернуть исходное значение">Текущая ставка = '+data_object.price_context+'</span>',
					style	:{fontSize: '9px'},
					verticalAlign: 'middle',
					textAlign	 : 'center',
					useHTML	: true
				},
				zIndex	: 100500,
				events	: {
					click	: ()=>{dd.target.value=data_object.price_context;}
				}
			}];
			if (data_object.price_context!=+q.target.value && rsya_selected) plotLines.push({
				value: q.target.value,
				width: 1,
				color: '#ff0000',
				label: {text: 'Введено', style: {fontSize: '8px'}}
			});

			$('#container').highcharts({
				title	: {
					text	: 'График зависимости охвата от ставки РСЯ',
					style	: {fontSize: '15px'}
				},
				subtitle: subtitle,
				xAxis	: {
					title	 : {text: 'Ставка'},
					plotLines: plotLines,
					crosshair: true
				},
				yAxis	: [{
					title: {text: 'Возможный охват (кликов и показов)'},
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}],
					crosshair: true
				}],
				tooltip: {
					shared: true,
					crosshairs: true
				},
				legend	: {
					layout: 'vertical',
					align : 'right',
					verticalAlign: 'middle',
					borderWidth  : 1
				},
				series		: series,
				animation	: false,
				plotOptions	: {
					series: {
						cursor: 'pointer',
						point : {
							events: {
								click: function() {
									dd.target.value=this.x;
									on(q);
								}
							}
						}
					}
				},
				chart: {
					events: {
						click: ()=>on(q)
					},
					backgroundColor: rsya_selected ? 'white' : 'darkslategrey'
				},
			});
		} /* if rsya_selected */



		/*=========================================
		  Аукцион
		  =========================================*/
		else {

			containers.css({'height': 600});

			var nulls=data_object.premium.map(x=>null);
			nulls.push(null);

			var series2=[{
				name : 'СП.мин.ставка',
				data : data_object.premium.map(x=>x.bid_price/1e6),
				color: 'red'
			},{
				name : 'Г.мин.ставка',
				data : [...nulls, ...data_object.guarantee.map(x=>x.bid_price/1e6)],
				color: 'pink'
			},{
				name : 'СП.спис.цена',
				data : data_object.premium.map(x=>x.amnesty_price/1e6),
				color: 'mediumseagreen'
			},{
				name : 'Г.спис.цена',
				data : [...nulls, ...data_object.guarantee.map(x=>x.amnesty_price/1e6)],
				color: 'darkseagreen'
			}];
			series2.forEach(x=>(
				x.minPointLength=3,
				x.animation		= false,
				x.crisp			= true,
				x.borderWidth	= 0,
				x.groupPadding	= 0,
				x.pointWidth	= 20,
				x.dataLabels	= {enabled: true},
			x));

			var asdf=data_object.guarantee.map((x,i)=>'Г'+(i+1));
			asdf.unshift('...');
			var categories = [...data_object.premium.map((x,i)=>(i+1)+'СП'), asdf];


			$('#container').highcharts({
				title: {
					text : 'Аукцион на поиске',
					style: {fontSize: '15px'}
				},
				subtitle: subtitle,
				xAxis	 : [{
					title: {text: 'Размещение'},
					allowDecimals: false,
					categories	 : categories,
					crosshair	 : true,
				}],
				yAxis	: {
					title: {text: 'Ставка / списание'},
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					},{
						value	: data_object.price,
						width	: 3,
						color	: '#00ff00',
						label	: {
							text 	: '<span title="Кликните по линии, чтобы вернуть исходное значение">Текущая ставка = '+data_object.price+'</span>',
							style	: {fontSize: '9px',},
							verticalAlign: 'middle',
							textAlign	 : 'center',
							useHTML	: true
						},
						zIndex	: 100500,
						events	: {
							click	: ()=>{dd.target.value=data_object.price;}
						}
					},{
						value: q.target.value,
						width: 1,
						color: '#ff0000',
						label: {text: 'Введено', style:{fontSize: '8px'}}
					}],
					crosshair: true
				},
				legend	 : {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'middle',
					borderWidth: 1
				},
				tooltip: {
					crosshairs: true
				},
				series: series2,
				chart : {
					type	: 'bar',
					backgroundColor: rsya_selected ? 'darkslategrey' : 'white'
				},
				plotOptions: {
					series: {
						cursor: 'pointer',
						point: {
							events: {
								click: function() {
									dd.target.value=this.y;
									on(q);
								}
							}
						}
					}
				},
			}); /* container */
		} /* else */

	$(containers).show();	
}; /* function - on */

/* добавление ивента */
$(".b-group-phrase .input__control.b-edit-phrase-price__control").on('mouseover', on/*_closure*/);
$("body").on('keydown', (data)=>(data.key=="Escape" && $(".highcharts_container").hide(), 1));
console.clear(); console.log(c);
})();