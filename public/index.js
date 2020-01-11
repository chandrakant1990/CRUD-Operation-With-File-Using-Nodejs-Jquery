function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
}

function login() {
  const data = {
    username: $("#username").val(),
    password: $("#password").val()
  };
  sendRequest("post", "/loginUser", data, result => {
    if (result.status) {
      window.open("Register.html", "_self");
    } else {
      alert(result.message);
    }
  });
}

function checkLogin(cb) {
  sendRequest("post", "/checkLogin", {}, result => {
    if (result.status == false) window.open("index.html", "_self");
    else {
      if (cb) cb();
    }
  });
}

function logout() {
  sendRequest("post", "/logout", {}, result => {
    window.open("index.html", "_self");
  });
}

function addUserDetails() {
  if ($("#name").val() == "" || $("#city").val() == "") {
    alert("Please fill all details");
  } else if (document.getElementById("image").files.length == 0) {
    alert("Please Select File");
  } else if (
    document.getElementById("image").files[0].type != "image/jpeg" &&
    document.getElementById("image").files[0].type != "image/png"
  ) {
    showAlert("Please select JPG ot PNG image");
    return;
  } else {
    var form = new FormData();
    form.append("image", document.getElementById("image").files[0]);
    form.append("name", $("#name").val());
    form.append("city", $("#city").val());
    form.append("sno", $("#sno").val());
    sendRequest(
      "post",
      "/addUSerDetails",
      form,
      result => {
          result=JSON.parse(result);
        if (result.status == true) {
          $("#name").val("");
          $("#city").val("");
          $("#sno").val("");
          openUserList();
        } else {
          alert(result.message);
        }
      },
      true
    );
  }
}

function sendRequest(method, urlName, data, cb, multipartData) {
  if (multipartData != null) {
    $.ajax({
      url: urlName,
      method: method || "get",
      data: data,
      mimeType: "multipart/form-data",
      cache: false,
      contentType: false,
      processData: false,
      success: function(result) {
        cb(result);
      }
    });
  } else {
    $.ajax({
      url: urlName,
      method: method || "get",
      data: data,
      success: function(result) {
        cb(result);
      }
    });
  }
}

function openUserList() {
  window.open("showUserList.html", "_self");
}

function showList() {
  sendRequest("get", "/showUserList", {}, result => {
    if (result.status) {
      // window.open("Register.html", "_self");
      createUserListTable(result);
    } else {
      alert(result.message);
    }
  });
}

function createUserListTable(result) {
  if (result.content.length > 0) {
    let tableHtml = "<table border='1px'><tr>";
    const columns = Object.keys(result.content[0]);

    columns.forEach(d => {
      tableHtml = tableHtml + "<td class='th-tr'>" + d + "</td>";
    });
    tableHtml = tableHtml + "<td class='th-tr'>Action</td>";
    tableHtml = tableHtml + "</tr>";
    result.content.forEach(data => {
      tableHtml = tableHtml + "<tr>";
      columns.forEach(d => {
          if(d!="filename"){
                tableHtml = tableHtml + "<td class='th-tr'>" + data[d] + "</td>";
          }else{
                tableHtml = tableHtml + "<td class='th-tr'><img src='/userPhotos/"+data[d]+"' width='200px' height='110px'></img></td>";
          }
      });
      tableHtml =
        tableHtml +
        "<td class='th-tr'>\
            <input type='checkbox' name='userId' value='" +
        data["sno"] +
        "' class='userId'/>\
            </td>";
      tableHtml = tableHtml + "</tr>";
    });
    tableHtml = tableHtml + "</table>";
    document.querySelector("#userList").innerHTML = tableHtml;
  } else {
    document.querySelector("#userList").innerHTML =
      "<div>No Data Available</div>";
  }
}

function backToRegistration() {
  window.open("Register.html", "_self");
}

function deleteData() {
  const userIDs = [];
  var checkboxes = document.getElementsByName("userId");
  for (var i = 0, n = checkboxes.length; i < n; i++) {
    if (checkboxes[i].checked) {
      userIDs.push(checkboxes[i].value);
    }
  }
  if (userIDs.length > 0) {
    const userConfirm = confirm("Are you sure want to remove?");
    if (userConfirm == true) {
      const data = {
        userIDs: userIDs
      };
      sendRequest("post", "/removeUserDetails", data, result => {
        if (result.status == true) {
          createUserListTable(result);
        } else {
          alert(result.error.message);
        }
      });
    }
  }
}

function showUpdateData() {
  const userIDs = [];
  var checkboxes = document.getElementsByName("userId");
  for (var i = 0, n = checkboxes.length; i < n; i++) {
    if (checkboxes[i].checked) {
      userIDs.push(checkboxes[i].value);
    }
  }
  if (userIDs.length > 1) {
    alert("you can update oly one record at a time");
  } else {
    window.open("Register.html?sno=" + userIDs[0], "_self");
  }
}

function getUserDetailsById(sno) {
  const data = {
    userID: sno
  };
  sendRequest("get", "/getUserDetailsById", data, result => {
    if (result.status == true) {
      if (result.content.length != 0) {
        $("#name").val(result.content[0].name);
        $("#city").val(result.content[0].city);
        $("#sno").val(result.content[0].sno);
         $("#uploadedPhotoPreview").empty();
          $("#uploadedPhotoPreview").append("<img src='/userPhotos/"+result.content[0].filename+"' width='200px' height='110px'></img>")
      }
    } else {
      alert(result.error.message);
    }
  });
}

function onSelectPhotoImage() {
  $("#image").click();
}

function showPreviewOfUploadedPhoto(fileData) {
  if (fileData.files && fileData.files[0]) {
    var fileName = fileData.files[0].name;
    var reader = new FileReader();

    reader.onload = function(e) {
      var image = new Image();
      image.addEventListener("load", function() {
        $("#uploadedPhotoPreview").empty();
        const preview = document.getElementById("uploadedPhotoPreview");
        preview.appendChild(this);
        $("#selectedFileName").text(fileName);
      });

      image.src = e.target.result;
    };

    reader.readAsDataURL(fileData.files[0]);
  }
}
