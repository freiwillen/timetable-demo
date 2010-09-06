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
				  this.Cell = function(pms){
					  this.day = pms.day
					  this.timetable = this.day.timetable
					  this.state = pms.state
					  this.position = Number(pms.position)
					  this.container_id = this.day.timetable.container.attr('id')+'_'+this.day.day+'-'+this.day.month+'-'+this.day.year+'_'+this.position
					  this.start = (this.position-this.position%2)/2
					  if(this.position%2 == 1){this.start+=':30'}else{this.start+=':00'}
					  this.end = (this.position+1-(this.position+1)%2)/2
					  if((this.position+1)%2 == 1){this.end+=':30'}else{this.end+=':00'}
					  
					  this.build_td = function(){
					    if(this.timetable.time_marks[this.position/2]){var style="border-right:1px solid black"}else{var style=""}
					    $('#'+this.container_id).data('day',day)
					    return '<td class="t_cell '+this.timetable.cell_states[this.state]+'" id="'+this.container_id+'" title="'+this.end+'" alt="'+this.state+'" style="'+style+'"></td>'
					  }
					  
					  this.next_state = function(){
    					var ns = this.timetable.next_cell_state
    					var r = ''
    					if(ns == 'auto'){
    						var cs = this.state
    						ns = Number(cs) + 1
    						if(this.timetable.cell_states[ns]){r = ns}else{r = 0}
    					}else{
    						r = ns
    					}
    					return r
    				}
				  }
					this.create_timeline = function(states){
					  var day = this
					  var result = new Array()
					  states.each_with_index(function(state,i){
					    result.push(new day.Cell({'day':day, 'state':state, 'position':i}))
					  })
					  return result
					}
					this.timetable = pms.timetable
					this.sequence_number = pms.sequence_number
					this.day = pms.day
					this.month = pms.month
					this.year = pms.year
					this.timeline = this.create_timeline(pms.timeline)
					this.row = ''
					this.change_cell_state = function(cn,ns){
						this.timeline[cn] = ns
					}
					
					this.build_row = function(){
					  var row_id = this.timetable.container.attr('id')+'_'+this.day+'-'+this.month+'-'+this.year
					  var r = '<tr id="'+row_id+'"><td>'+day.day+'.'+day.month+'.'+day.year+'</td>'
					  r += this.timeline.map(function(cell){
					    return cell.build_td()
					  }).join('')
					  return r+'</tr>'
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
					
					//this.humanized_timeline = pms.humanized_timeline || this.humanize_timeline()
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
				
				this.find_day = function(date){
				  var date = date.split('-')
				  return this.days.find(function(day){
				    return day.day == Number(date[0]) && Number(day.month)  == Number(date[1])  && Number(day.year)  == Number(date[2])
				  })
				}
				
	//*************************************************			
				this.draw = function(){
					//console.log('draw starts')
					var days = this.days
					if(this.time_marks){
						var tmr = ''
						this.container.html(tmr)
					}else{
						this.container.html('')
					}
					var timetable = this
					days.each(function(day){
					  timetable.container.append(day.build_row())
					})
					$('#'+this.container.attr('id')+' .t_cell').click(function(){
						if (timetable.hover == 'off'){
						  var day = timetable.find_day($(this).attr('id').split('_')[1])
							timetable.selection_start = {'day':day.sequence_number,'cell':$(this).attr('id').split('_')[2]}
							timetable.selection_end = {'day':day.sequence_number,'cell':$(this).attr('id').split('_')[2]}
							timetable.draw_selection()
					  	$('.t_cell').hover(function(){
								var day = timetable.find_day($(this).attr('id').split('_')[1])
								timetable.selection_end = {'day':day.sequence_number,'cell':$(this).attr('id').split('_')[2]}
								timetable.draw_selection()
					  	})
					  	timetable.hover = 'on'
				  	}else{
				  		timetable.hover = 'off'
							$('.t_cell').unbind('mouseenter mouseleave')
							timetable.apply_selection()
							timetable.draw_applied_selection()
							timetable.end_selection_callback()
						}
					})
				}
//**********************************************************************
				
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
					var timetable = this
			 		this.days.each_with_index(function(day,i){
			 		  day.timeline.each(function(cell){
			 		    var cell_id = cell.container_id
							var cell_container = $('#'+cell_id)
							if(day.sequence_number >= bs.d1 && day.sequence_number <= bs.d2 && cell.position >= bs.c1 && cell.position <= bs.c2){
								var state = cell.next_state()
							}else{
								var state = cell.state
							}
							cell_container.attr('class','t_cell '+timetable.cell_states[state])
			 		  })
			 		})
				}
				
				
				this.draw_applied_selection = function(){
					var timetable = this
					this.days.each_with_index(function(day,i){
					  day.timeline.each_with_index(function(cell,j){
							container = $('#'+cell.container_id)
							container.attr('class','t_cell '+timetable.cell_states[cell.state])
					  })
					})
				}
							
				this.apply_selection = function(){
					var bs = this.selection_borders()
					this.days.each(function(day){
					  if(day.sequence_number >= bs.d1 && day.sequence_number <= bs.d2){
					    day.timeline.each(function(cell){
					      if(cell.position >= bs.c1 && cell.position <= bs.c2){
					        cell.state = cell.next_state()
					      }
					    })
					    day.refresh_humanized_timeline()
					  }
					})
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
			