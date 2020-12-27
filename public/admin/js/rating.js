$(document).ready(function(e){
    let ratings = 0;
    $('.fa-5x').mouseover(function(e){

        let color = $(this).css('color');
        if(color != 'rgb(255, 215, 0)'){
            $(this).css('color', 'gold')
            ratings += 1
        }else{
             $(this).css('color', 'rgb(214, 211, 211)')
             ratings -= 1
        }
        $('#rating').attr('value', ratings)
        $('#rating-text').html(`<b>${ratings}.0 Rating</b>` )

    })


    $('#rating_form').submit(function(e){
        e.preventDefault()

        let data = $(this).serialize()
        let action = $(this).attr('action');
        let company_id = $('#company').attr('value')

        if(ratings == 0){
            swal({  //sweetalert.js library
                title:  `Rating Error`,
                text: `Opps! You have to review with a single star rating at least. Try again ): `,
                icon: "error",    
                timer: 5500,
                closeOnClickOutside: false  
              });
        }else{
            $.ajax({
                url: action,
                data: data,
                type: 'POST',
                cache: false,
                success: (data=>{
                    if(!data.error){
                        swal({  //sweetalert.js library
                            title:  `Rating Success`,
                            text: `Bravos! You've successfully submitted your ratings. Keep the good spirit :) `,
                            icon: "success",    
                            timer: 5500,
                            closeOnClickOutside: false  
                          });

                          setInterval( ()=>{
                             window.location.replace(`/admin/company/show/${company_id}`)
                          }, 7000)
                    }
                })
            })
        }
    })
})