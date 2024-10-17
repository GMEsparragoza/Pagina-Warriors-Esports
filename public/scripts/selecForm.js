let PlayerForm = document.querySelector("#PlayerForm");
let StaffForm = document.querySelector("#StaffForm");
let btn = document.getElementById("btn");
let butPlayer = document.getElementById("butPlayer");
let butStaff = document.getElementById("butStaff");
    
const toggleForm = (FormType) => {
    if (FormType == 'Staff') {
        StaffForm.classList.add('active');
        PlayerForm.classList.remove('active');
        btn.style.left = "110px";
        butStaff.style.color = "#000";
        butPlayer.style.color = "#edededcd";
    } else {
        PlayerForm.classList.add('active');
        StaffForm.classList.remove('active');
        btn.style.left = "0";
        butStaff.style.color = "#edededcd";
        butPlayer.style.color = "#000";
    }
}
    
