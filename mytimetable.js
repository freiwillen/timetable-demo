function daysInMonth(iMonth, iYear){
	return 32 - new Date(iYear, iMonth, 32).getDate();
}		

			function Timetable(pms){
				this.container = $(pms.container)
				this.days = []
				this.start = pms.start
				this.end = pms.end
				this.cell_states = {0:'closed',1:'working'}
				this.hover = 'off'
				this.selection_start = {day:'',cell:''}
				this.selection_end = {day:'',cell:''}
				this.next_cell_state = 'auto'
				this.draw_on_start = pms.draw_on_start && true
				
				
				this.time_marks = {}
				
				if(pms.time_marks){
					for(j=0;j<=pms.time_marks.length;j++){
						this.time_marks[pms.time_marks[j]] = true
					}
				}else{
					this.time_marks = false	
				}
				
				this.end_selection_callback = pms.end_selection_callback || function(){}
				
				this.Day = function(pms){
					this.timetable = pms.timetable
					this.sequence_number = pms.sequence_number
					this.day = pms.day
					this.month = pms.month
					this.year = pms.year
					this.timeline = pms.timeline
					this.row = ''
					//this.humanized_timeline = pms.humanized_timeline || this.humanize_timeline()
					
					this.change_cell_state = function(cn,ns){
						this.timeline[cn] = ns
					}
					
					this.humanize_timeline = function(){
/********make this universal too***************/
						var humanized = ''
						for(var j=1;j<=48;j++){
							
							if(j-2 >= 0){p = this.timeline[j-2]}else{p = 4}
							if(j-1 >= 0){c = this.timeline[j-1]}else{c = 3}
							//if(j < 48){n = $('#cell'+(j+1)+'_'+line).attr('alt')}else{n = 2}
							if(j < 48){n = this.timeline[j]}else{n = 0}
							
							
							tj = j-1
							tje = j
							rs = (tj-tj%2)/2
							re = (tje-tje%2)/2
							
							if(tj%2 == 0){rs+=':00'}else{rs+=':30'}
							if(tje%2 == 0){re+=':00'}else{re+=':30'}
							if((p == 0 || p == 4) && c == 1 && (n == 0 || n == 2)){
								humanized += rs+', '
							}else if((p == 0 || p == 4) && c == 1 && n == 1){
								humanized += rs+'-'
							}else if(p == 1 && c == 1 && n == 0){
								humanized += re+', '
							}
						}
					return humanized.replace(/(, )$/,'')
					}
					
					this.refresh_humanized_timeline = function(){
						this.humanized_timeline =  this.humanize_timeline()
					}
					
					this.humanized_timeline = pms.humanized_timeline || this.humanize_timeline()
				}
				
				this.add_day = function(pms){
					day = new this.Day({
						timetable: this,
						sequence_number: this.days.length+1,
						day: pms.day,
						month: pms.month,
						year: pms.year,
						timeline: pms.timeline || '000000000000000000000000000000000000000000000000'.split('')
					})
					this.days.push(day)
				}
				
				
				
	//*************************************************			
				this.draw = function(){
					//console.log('draw starts')
					days = this.days
					if(this.time_marks){
						tmr = ''
						/*tmr = '<tr><td></td><td colspan="48">'
							tl = 8*48
							
							for(j=0;j<=this.time_marks.length;j++){	
								if(this.time_marks[j] == i/2)t = i/2
								p
								tmr += '<span>'+t+'</span>'
							}
							

						tmr +='</td></tr>'*/
						this.container.html(tmr)
					}else{
						this.container.html('')
					}
					//console.log('days.length: '+days.length)
					for(i=1;i<=days.length;i++){
						day = this.days[i-1]
						row_id = cell_id = this.container.attr('id')+'_'+day.day+'-'+day.month+'-'+day.year
						
						r = '<tr id="'+row_id+'"><td>'+day.day+'.'+day.month+'.'+day.year+'</td></tr>'
						this.container.append(r)
						day.row = $('#'+row_id)
						
						for(j=1;j<=48;j++){
							cell_id = this.container.attr('id')+'_'+days[i-1].day+'-'+days[i-1].month+'-'+days[i-1].year+'_'+j
							cell_state = day.timeline[j-1]
							if(this.time_marks[j/2]){style="border-right:1px solid black"}else{style=""}
							c = '<td class="t_cell '+this.cell_states[cell_state]+'" id="'+cell_id+'" title="'+(j/2+':00').replace('.5:00',':30')+'" alt="'+cell_state+'" style="'+style+'"></td>'
							day.row.append(c)
							$('#'+cell_id).data('day',day)
						}
					}
					//$('#'+this.container.attr('id')+' .t_cell').click(function(){
					$('#'+this.container.attr('id')+' .t_cell').click(function(){
						day = $(this).data('day')
						timetable = day.timetable
						
						if (timetable.hover == 'off') {
							//console.log(day.sequence_number);
							timetable.selection_start = {'day':day.sequence_number,cell:$(this).attr('title').replace(':00','').replace(':30','.5')*2}
							timetable.selection_end = {'day':day.sequence_number,cell:$(this).attr('title').replace(':00','').replace(':30','.5')*2}
							timetable.draw_selection()
					  	$('.t_cell').hover(function(){
					  		day = $(this).data('day')
								//console.log($(this).attr('id'))
								timetable = day.timetable
								timetable.selection_end = {'day':day.sequence_number,cell:$(this).attr('title').replace(':00','').replace(':30','.5')*2}
								timetable.draw_selection()
					  	})
					  	
					  	timetable.hover = 'on'
				  	}else{
				  		timetable.hover = 'off'
							$('.t_cell').unbind('mouseenter mouseleave')
							timetable.apply_selection()
							//timetable.draw()
							timetable.draw_applied_selection()
							timetable.end_selection_callback()
						}
						//console.log(timetable.hover)
					})
				}
//***************************				***********************************
				
				this.selection_borders = function(){
					var day1 = this.selection_start.day
					var cell1 = this.selection_start.cell
					var day2 = this.selection_end.day
					var cell2 = this.selection_end.cell
					if(day2 < day1){
						day1 = this.selection_end.day
						day2 = this.selection_start.day
					}
					if(cell2 < cell1){
						cell1 = this.selection_end.cell
						cell2 = this.selection_start.cell
					}
					return {d1:day1,c1:cell1,d2:day2,c2:cell2}
				}
				
				this.draw_selection = function(){
					var bs = this.selection_borders()
			 		var ns = this.get_next_cell_state()
					//console.log(bs.d1+'.'+bs.c1+'-'+bs.d2+'.'+bs.c2)
					for(var i=1;i<=this.days.length;i++){
						
						var day = this.days[i-1]
						for(var j=1;j<=day.timeline.length;j++){
							cell_id = this.container.attr('id')+'_'+day.day+'-'+day.month+'-'+day.year+'_'+j
							
							cell = $('#'+cell_id)
							
							if(i >= bs.d1 && i <= bs.d2 && j >= bs.c1 && j <= bs.c2){
								cell.attr('class','t_cell '+this.cell_states[ns])
							}else{
								cell.attr('class','t_cell '+this.cell_states[day.timeline[j-1]])
							}
						}
					}
					//alert(d1+' '+c1+' '+d2+' '+c2)
				}
				
				
				this.draw_applied_selection = function(){
					var bs = this.selection_borders()
					var ns = this.get_next_cell_state()
					//alert(ns)
					for(var i=1;i<=this.days.length;i++){
						
						day = this.days[i-1]
						for(var j=1;j<=day.timeline.length;j++){
							cell_id = this.container.attr('id')+'_'+day.day+'-'+day.month+'-'+day.year+'_'+j
							
							cell = $('#'+cell_id)

								cell.attr('class','t_cell '+this.cell_states[day.timeline[j-1]])
							//console.log(cell_id)
						}
					}
					//alert(d1+' '+c1+' '+d2+' '+c2)
				}
				
				this.get_next_cell_state = function(){
					var bs = this.selection_borders()
					var ns = this.next_cell_state
					var r = ''
					if(ns == 'auto'){
						bs = this.selection_borders()
						//console.log(bs.d1)
						cs = Number(this.days[bs.d1-1].timeline[bs.c1-1])
						if(this.cell_states[cs+1]){r = cs+1/*;alert(cs+' '+this.cell_states[cs+1])*/}else{r = 0}
					}else{
						r = ns
					}
					return r
				}
				
				this.apply_selection = function(){
					var bs = this.selection_borders()
					var ns = this.get_next_cell_state()
					for(var i=bs.d1;i<=bs.d2;i++){
						day = this.days[i-1]
						for(var j=bs.c1;j<=bs.c2;j++){
							day.timeline[j-1]=ns
						}
						day.refresh_humanized_timeline()
					}
				}
				
				this.dateline = function(){
					var start = this.start
					var end = this.end
					var years = {}
					if(start.year <= end.year){
						for(var k=start.year;k<=end.year;k++){
							years[k] = {}
							if(start.month == end.month && start.year == end.year){
								years[k][start.month] = []
								for(var i=start.day;i<=end.day;i++)years[k][start.month].push(i)
							}else if((start.month < end.month && start.year == end.year)){
								for(var i=start.month;i<=end.month;i++){
									years[k][i] = []
									if(i != start.month && i != end.month){
										sd = 1
										ed = daysInMonth(i-1,k)
									}else if( i == start.month){
										sd = Number(start.day)
										ed = daysInMonth(i-1,k)
									}else if(i == end.month){
										sd = 1
										ed = Number(end.day)
									}
									for(var j=sd;j<=ed;j++)years[k][i].push(j)
								}
							}else if(end.year > start.year){
								if(k != start.year && k != end.year){
									sm = 1
									em = 12
								}else if(k == start.year){
									sm = Number(start.month)
									em = 12
								}else if(k == end.year){
									sm = 1
									em = Number(end.month)
								}
								for(var i=sm;i<=em;i++){
									years[k][i] = []
									if(i != start.month && i != end.month){
										sd = 1
										ed = daysInMonth(i-1,k)
									}else if( i == start.month){
										sd = Number(start.day)
										ed = daysInMonth(i-1,k)
									}else if(i == end.month){
										sd = 1
										ed = Number(end.day)
									}
									for(var j=sd;j<=ed;j++)years[k][i].push(j)
								}
							}
						}
					}
					
					return years
				}
				
				
				this.parse_date = function(date){
					date = date.split('.')
					return({day:Number(date[0]),month:Number(date[1]),year:Number(date[2])})
				}
				
				this.add_days = function(){
					var dtln = this.dateline()
					//alert(dtln)
					//console.log(dtln)
					//console.log('add_days starts')
					for(var year in dtln){
						for(var month in dtln[year]){
							for(var i=0;i<dtln[year][month].length;i++){
								//console.log(year+' '+month+' '+dtln[year][month][i])
								this.add_day({'year':year,'month':month,'day':dtln[year][month][i]})
							}
						}
					}
				}
				
				this.replace_day = function(day){
					var days = this.days
					for(var i=0;i<days.length;i++){
						//console.log(days[i].day+' == '+day.day+' && '+days[i].month+' == '+day.month+' && '+days[i].year+' == '+day.year)
						if(days[i].day == day.day && days[i].month == day.month && days[i].year == day.year){
							day.sequence_number = i+1
							days[i] = day
						}
					}
				}
				
				this.update_days = function(){
					var dtln = this.dateline()
					var nds = []
					var dtp
					for(var year in dtln){
						for(var month in dtln[year]){
							for(var i=0;i<dtln[year][month].length;i++){
								dtp = 0
								for(day in this.days){
									if(this.days[day].year == year && this.days[day].month == month && this.days[day].day == dtln[year][month][i]) {
				  					dtp = this.days[day]
										dtp.sequence_number = nds.length+1
				  				}
								}
								if(dtp == 0){
									dtp = new this.Day({
										timetable: this,
										sequence_number: nds.length+1,
										'day': dtln[year][month][i],
										'month': month,
										'year': year,
										'timeline': '000000000000000000000000000000000000000000000000'.split('')
									})
								}
								nds.push(dtp)
							}
						}
					}
					this.days = nds
					//console.log(k)
				}
				
				this.start = this.parse_date(this.start)
				this.end = this.parse_date(this.end)
				this.add_days()
				if(this.draw_on_start)this.draw()
				
			}
			