function daysInMonth(iMonth, iYear){
  return 32 - new Date(iYear, iMonth, 32).getDate();
} 

function Timetable(pms){
  this.mode = pms.mode || 'timetable'
  this.container = $(pms.container)
  this.days = []
  this.start = pms.start
  this.end = pms.end
  this.cell_states = pms.cell_states || {0:'closed',1:'working'}
  this.hover = 'off'
  this.selection_start = {day:'',cell:''}
  this.selection_end = {day:'',cell:''}
  this.next_cell_state = function(){return $('#'+this.container.attr('id')+' .cells_state input:checked').attr('value')}//'auto'
  this.draw_on_start = pms.draw_on_start && true
  this.clone_day = function(){return $('#'+this.container.attr('id')+'_clone').attr('checked')}
  this.show_humanized_timelines = pms.show_humanized_timelines || false
  this.clone_etalone = ''
  this.time_marks = {}
  
  if(pms.time_marks){
    for(var j=0;j<=pms.time_marks.length;j++)
      this.time_marks[pms.time_marks[j]] = true
  }else{
    this.time_marks = false  
  }
  
  this.time_mark_colspans = []
  
  for(var i=0;i<pms.time_marks.length;i++){
    var mark = pms.time_marks[i]
    if(i==0){
      var last_mark = 0
    }else{
      var last_mark = pms.time_marks[i-1]
    }
    this.time_mark_colspans.push([mark,mark - last_mark]) 
  }
  this.time_mark_colspans.push(['',47 - mark - last_mark])
  
  this.end_selection_callback = pms.end_selection_callback || function(){}
  
  this.add_controls = function(){
    r = '<tr>'
    r += '<td><input type="checkbox" id="'+this.container.attr('id')+'_clone"> clone row </td>'
    r += '<td  class="cells_state" colspan="48">'
    var states = this.cell_states
    for(var key in states){
      r += '<input type="radio" id="'+this.container.attr('id')+'_cell_state'+key+'" name="'+this.container.attr('id')+'_cells_state" value="'+key+'"><label for="cell_state'+key+'">'+states[key]+'</label>&nbsp;&nbsp;'  
    }
    r += '<input type="radio" id="'+this.container.attr('id')+'_cell_stateauto" name="'+this.container.attr('id')+'_cells_state" value="auto" checked="checked"><label for="cell_stateauto">auto</label>&nbsp;&nbsp;'
    r += '</td>'
    r += '</tr>'
   this.container.append(r) 
  }
  
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
        if(this.timetable.time_marks[(this.position+1)/2]){var style="border-right:1px solid black"}else{var style=""}
        $('#'+this.container_id).data('day',day)
        return '<td class="t_cell '+this.timetable.cell_states[this.state]+'" id="'+this.container_id+'" title="'+this.start+'…'+this.end+'" alt="'+this.state+'" style="'+style+'"></td>'
      }
      
      this.next_state = function(){
        var ns = this.timetable.next_cell_state()
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
    this.sequence_number = Number(pms.sequence_number)
    this.day = pms.day
    this.month = pms.month
    this.year = pms.year
    this.timeline = this.create_timeline(pms.timeline)
    this.row = ''
    this.row_id = ''
    
    this.change_cell_state = function(cn,ns){
      this.timeline[cn] = ns
    }
    
    this.clone_day = function(day){
      this.timeline.each(function(cell){
        day.timeline[cell.position].state = cell.state
      })
    }
    
    this.monday = function(){
      var d = new Date(this.year,this.month-1,this.day)
      return (d.getDay() == 1)
    }
    
    this.day_name = function(){
      var d = new Date(this.year,this.month-1,this.day)
      //var day_names = ['Неділя','Понеділок','Вівторок','Середа','Четвер','П’ятниця','Субота']
      var day_names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      return day_names[d.getDay()]
    }
    
    this.build_row = function(){
      var row_id = this.timetable.container.attr('id')+'_'+this.day+'-'+this.month+'-'+this.year
      this.row_id = row_id
      var r = '';
      if(this.monday()){
        var marks = this.timetable.time_mark_colspans
        r+= '<tr><td></td>'
        for(var i=0;i<marks.length;i++){
          r+= '<td colspan="'+marks[i][1]*2+'" align="right">'+marks[i][0]+'</td>'
        }
        r+= '<td></td></tr>'
      }
      r += '<tr id="'+row_id+'"><td class="row_date">'+this.day+'.'+this.month+'.'+this.year+', '+this.day_name()+'</td>'
      r += this.timeline.map(function(cell){
        return cell.build_td()
      }).join('')
      return r+'<td id="'+row_id+'_humanized'+'" class="humanized_timeline"></td></tr>'
    }
    
    this.humanize_timeline = function(){
      var humanized = ''
      var timetable = this.timetable
      var timeline = this.timeline.map(function(cell){
        return cell.state
      })
      var states = {}
      var r = {}
      for(var key in timetable.cell_states){
        states[key] = []
        timeline.each_with_index(function(cell_state,index){
          if(Number(cell_state) == Number(key) && (states[key].length == 0 || timeline[index-1] != key)){
            states[key].push([index])
            //console.log(cell_state+' '+ key)
          }else if(Number(cell_state) == Number(key)){
            states[key][states[key].length-1].push(index)
          }
        })
        var sr = []
        var cells = this
        states[key].each(function(state){
          if(state.length > 1){
            sr.push(cells.timeline[state.first()].start+'…'+cells.timeline[state.last()].end)
          }else if(states[key].length == 1){
            sr.push(cells.timeline[state.first()].start)
          }
        })
        r[timetable.cell_states[key]] = sr//.join(', ')
      }
    //console.log(r.join(', '))
    return r//.join(', ')
    }
    
    this.refresh_humanized_timeline = function(){
      this.humanized_timeline = this.humanize_timeline()
      if(this.timetable.show_humanized_timelines){
        var r = []
        var tl = this.humanized_timeline
        for(var key in tl){
          if(tl[key].any()){
            r.push(key+': '+ tl[key].join(', '))
          }
        }
      
        $('#'+this.row_id+'_humanized').html(r.join('; '))  
      }
    }
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
     
  this.draw = function(){
    var days = this.days
    if(this.time_marks){
      var tmr = ''
      this.container.html(tmr)
    }else{
      this.container.html('')
    }
    var timetable = this
    this.add_controls()
    days.each(function(day){
      timetable.container.append(day.build_row())
      day.timeline.each(function(cell){cell.container = $('#'+cell.container_id)})
    })
    $('#'+this.container.attr('id')+' .t_cell').click(function(){
      if (timetable.hover == 'off'){
        var day = timetable.find_day($(this).attr('id').split('_')[1])
        //var day = this.day
        timetable.selection_start = {'day':day.sequence_number,'cell':$(this).attr('id').split('_')[2]}
        timetable.selection_end = {'day':day.sequence_number,'cell':$(this).attr('id').split('_')[2]}
        if(timetable.clone_day() == false){
          timetable.draw_selection()
        }else if(timetable.clone_day() == true){
          timetable.clone_etalone = day
          timetable.draw_clones()
        }
        
        $('.t_cell').hover(function(){
          var day = timetable.find_day($(this).attr('id').split('_')[1])
          timetable.selection_end = {'day':day.sequence_number,'cell':$(this).attr('id').split('_')[2]}
          if(timetable.clone_day() == false){
            //if(selection_borders(timetable).c2 == 9){console.log(day)}
            timetable.draw_selection()
          }else if(timetable.clone_day() == true){
            timetable.draw_clones()
          }
        })
        timetable.hover = 'on'
      }else{
        timetable.hover = 'off'
        $('.t_cell').unbind('mouseenter mouseleave')
        if(timetable.clone_day() == false){
          apply_selection(timetable)
        }else if(timetable.clone_day() == true){
          apply_clones(timetable)
        }
        timetable.draw_changes()
        timetable.end_selection_callback()
      }
    })
  }


/*  this.selection_borders = function(){
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
*/

  this.draw_selection = function(){
    var bs = selection_borders(this)
    
      
    var timetable = this
     this.days.each_with_index(function(day,i){
       day.timeline.each(function(cell){
        if(day.sequence_number >= bs.d1 && day.sequence_number <= bs.d2 && cell.position >= bs.c1 && cell.position <= bs.c2){
          var state = cell.next_state()}else{var state = cell.state}
        cell.container.attr('class','t_cell '+timetable.cell_states[state])
       })
     })
  }
  
  this.draw_clones = function(){
    var bs = selection_borders(this)
    var timetable = this
    var etalone = timetable.clone_etalone.timeline
    this.days.each_with_index(function(day,i){
       day.timeline.each(function(cell){
        if(day.sequence_number >= bs.d1 && day.sequence_number <= bs.d2){
          var state = etalone[cell.position].state}else{var state = cell.state}
          //console.log(state)
        cell.container.attr('class','t_cell '+timetable.cell_states[state])
       })
     })
  }
  
  
  this.draw_changes  = function(){
    var timetable = this
    this.days.each_with_index(function(day,i){
      day.timeline.each_with_index(function(cell,j){
        cell.container.attr('class','t_cell '+timetable.cell_states[cell.state])
      })
    })
  }
        
  
  

  this.add_days = function(){
    var dtln = dateline(this)
    for(var year in dtln){
      for(var month in dtln[year]){
        for(var i=0;i<dtln[year][month].length;i++){
          this.add_day({'year':year,'month':month,'day':dtln[year][month][i]})
        }
      }
    }
  }
  
  this.replace_day = function(day){
    var days = this.days
    for(var i=0;i<days.length;i++){
      if(days[i].day == day.day && days[i].month == day.month && days[i].year == day.year){
        day.sequence_number = i+1
        days[i] = day
      }
    }
  }
  
  this.update_days = function(){
    var dtln = dateline(this)
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
  
  
  
  this.start = parse_date(this.start)
  this.end = parse_date(this.end)
  this.add_days()
  if(this.draw_on_start)this.draw()
//-----------------------------------------  
  function selection_borders(el){
    var day1 = Number(el.selection_start.day)
    var cell1 = Number(el.selection_start.cell)
    var day2 = Number(el.selection_end.day)
    var cell2 = Number(el.selection_end.cell)
    if(day2 < day1){
      day1 = el.selection_end.day
      day2 = el.selection_start.day
    }
    if(cell2 < cell1){
      cell1 = el.selection_end.cell
      cell2 = el.selection_start.cell
    }
    
    var r = {d1:Number(day1),c1:Number(cell1),d2:Number(day2),c2:Number(cell2)}
    //console.log(r)
    return {d1:Number(day1),c1:Number(cell1),d2:Number(day2),c2:Number(cell2)}
  }
  
  function parse_date(date){
    date = date.split('.')
    return({day:Number(date[0]),month:Number(date[1]),year:Number(date[2])})
  }
  
  function dateline(el){
    var start = el.start
    var end = el.end
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
  
  
  function apply_selection(el){
    var bs = selection_borders(el)
    el.days.each(function(day){
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
  
  function apply_clones(el){
    var bs = selection_borders(el)
    //var timetable = this
    var etalone = el.clone_etalone.timeline
    el.days.each_with_index(function(day,i){
      if(day.sequence_number >= bs.d1 && day.sequence_number <= bs.d2){
         day.timeline.each(function(cell){
          cell.state = etalone[cell.position].state
         })
      }
     })
  }
  
}
