;(function($){
  
  //Parse JSON provided.
  $.fn.parseFromJSON = function(preview, raw, json){
    
    var el = $(this);
    
    try{
      var pack = JSON.parse(json);
    } catch (ex){
      console.log('Invalid JSON provided, reverting changes.', ex);
      el.regenerate('#preview', '#json');
      return;
    }
    
    //Package meta.
    el.find(':input[name=package_title]').val(pack.title.trim());
    el.find(':input[name=package_description]').val(pack.description.trim());
    el.find(':input[name=package_type]').val(pack.type.trim().toLowerCase());
    if(pack.dbUpdates){
      el.find(':input[name=package_db_updates]').attr('checked', 'checked')
    }else{
      el.find(':input[name=package_db_updates]').removeAttr('checked');
    }
    
    //Versions.
    el.find('ul.versions').html('');
    $.each(pack.versions || [], function(){
      
      var version = this
        , elv = $($('#version_template').html().trim()).appendTo(el.find('ul.versions'));
      
      //Version meta.
      elv.find(':input[name=version_version]').val(version.version.trim().toLowerCase());
      elv.find(':input[name=version_date]').val(version.date.trim());
      elv.find(':input[name=version_description]').val(version.description.trim());
      
      //Changes.
      elv.find('ul.changes').html('');
      $.each(version.changes || [], function(){
        
        var change = this
          , elc = $($('#change_template').html().trim()).appendTo(elv.find('ul.changes'));
        
        //Change data.
        elc.find(':input[name=change_title]').val(change.title.trim());
        elc.find(':input[name=change_description]').val(change.description.trim());
        elc.find(':input[name=change_url]').val(change.url ? change.url.trim() : '');
        
      });
      
    });
    
    //When everything is done, regenerate the preview and pretify the JSON.
    el.regenerate('#preview', '#json');
    
  };
  
  //Create jQuery extention to regenerate.
  $.fn.regenerate = function(preview, raw){
    
    var el = $(this)
      , pack = {};
    
    //Clear preview container.
    $(preview).html('');
    
    //Package meta.
    pack.title = el.find(':input[name=package_title]').val().trim();
    pack.description = el.find(':input[name=package_description]').val().trim();
    pack.type = el.find(':input[name=package_type]').val().trim().toLowerCase();
    pack.dbUpdates = el.find(':input[name=package_db_updates]').is(':checked');
    
    //Package versions.
    pack.versions = [];
    el.find('ul.versions li.version').each(function(){
      
      //Version meta.
      var version = {
        version: $(this).find(':input[name=version_version]').val().trim().toLowerCase(),
        date: $(this).find(':input[name=version_date]').val().trim(),
        description: $(this).find(':input[name=version_description]').val().trim(),
        changes: []
      };
      
      //Preview version meta.
      var versionPreview = $($('#version_preview').html().trim());
      versionPreview.find('.header')
        .attr('title', pack.description)
        .html(pack.title);
      versionPreview.find('.version').text(version.version);
      versionPreview.find('.date').text('('+version.date+')');
      versionPreview.find('.description').html(version.description);
      
      //Version changes.
      $(this).find('ul.changes li.change').each(function(){
        
        var change = {
          title: $(this).find(':input[name=change_title]').val().trim(),
          description: $(this).find(':input[name=change_description]').val().trim(),
          url: $(this).find(':input[name=change_url]').val().trim()
        };
        
        //Check if url needs to be removed.
        if(change.url == '')
          delete change.url;
        
        //Preview change.
        var changePreview = $($('#change_preview').html().trim());
        changePreview.find('.title').html(change.title);
        changePreview.find('.description').html(change.description);
        if(change.url){
          changePreview.find('.url').attr('href', change.url);
        } else {
          changePreview.find('.url').remove();
        }
        
        //Append the change.
        versionPreview.append(changePreview);
        version.changes.push(change);
        
      });
      
      //Append the version.
      $(preview).append(versionPreview);
      pack.versions.push(version);
      
    });
    
    //Insert raw json.
    $(raw).addClass('no-parse');
    $(raw).val(JSON.stringify(pack, null, '  '));
    $(raw).removeClass('no-parse');
    
  };
  
  //On document ready, bind events.
  jQuery(function($){
    
    $('#modifiers')
      
      /* ---------- Change / blur ---------- */
      .on('change blur', ':input', function(e){
        $('#modifiers').regenerate('#preview', '#json');
      })
      
      /* ---------- Add version ---------- */
      .on('click', '.add_version', function(e){
        
        e.preventDefault();
        
        $('#modifiers')
          .find('ul.versions')
            
            //Add template html to version list.
            .prepend($('#version_template').html().trim())
            
            //Add datepicker where needed.
            .find('li.version')
              .eq(0)
                .find('input[type=date]')
                .datepicker({dateFormat: 'yy-mm-dd'});
        
      })
      
      /* ---------- Add change ---------- */
      .on('click', '.add_change', function(e){
        
        e.preventDefault();
        
        $(e.target)
          .closest('li.version')
          .find('ul.changes')
          
          //Add template html to change list.
          .append($('#change_template').html().trim());
        
      })
      
    ;
    
    $('#json')
      
      /* ---------- Autoselect JSON ---------- */
      .on('focus', function(e){
        
        //Select all.
        $(this).select();
        
        //Prevent mouseup.
        $(this).mouseup(function(e){
          e.preventDefault();
          $(this).unbind('mouseup');
          return false;
        });
        
      })
      
      /* ---------- Import JSON ---------- */
      .on('change', function(e){
        
        //Sometimes we don't parse it.
        if($(this).is('.no-parse'))
          return true;
        
        $('#modifiers').parseFromJSON('#preview', '#json', $(this).val());
        
      })
      
    ;
    
  });
  
})(jQuery);
