//====================================================================================================================
//====================================================================================================================
// public/src/utils/sweetAlert.js
// js for SWAL2 utility
//====================================================================================================================
//====================================================================================================================
// notice: icon 종류 : success, error, warning, info, question
export default function showAlert(title = '알림', text, icon = 'info', confirmButtonText = 'OK') {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: confirmButtonText
    });
}