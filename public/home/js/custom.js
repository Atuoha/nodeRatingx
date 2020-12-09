
// $(document).ready( ()=>{
    
//     $('#forgot-form').submit(function(e){
//         e.preventDefault();
       
//         let data  = $(this).serialize();
//         let action = $(this).attr('action')

//         $.ajax({
//             url: action,
//             data: data,
//             type: 'POST',
//             cache: false,
//             success: (response=>{
//                 if(!response.error){
//                     alert(response)
//                     if(response == 'Email not recognized!'){
//                         swal({  //sweetalert.js library
//                             title:  `Email not Recognized`,
//                             text: `Error! You can't proceed with resetting your password. Your email is not recognised `,
//                             icon: "error",    
//                             timer: 5500,
//                             closeOnClickOutside: false  
//                           });                  
//                     }else{
//                         swal({  //sweetalert.js library
//                             title:  `Password Reset Sent`,
//                             text: `Kudos! You can proceed to your email. Password reset link has been sent to it`,
//                             icon: "success",    
//                             timer: 5500,
//                             closeOnClickOutside: false  
//                           });                  
//                     }
//                 }
//             })
//         })
//     })
// })