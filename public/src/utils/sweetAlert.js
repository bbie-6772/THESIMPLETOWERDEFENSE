//====================================================================================================================
//====================================================================================================================
// public/src/utils/sweetAlert.js
// js for SWAL2 utility
//====================================================================================================================
//====================================================================================================================
import Swal from 'sweetalert2';


// notice: icon 종류 : success, error, warning, info, question
export function showAlert(title, text, icon = 'info', confirmButtonText = 'OK') {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: confirmButtonText
    });
}