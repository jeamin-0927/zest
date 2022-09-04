let userData = new Object(); 
let users = new Array();
let myid, userList;


$(document).ready(() => {
    reset('.main');
    let title = ['진전있는', '행복한', '재미있는', '편한', '비밀스런', '감성적인', '사랑스러운'];
    $('.hoho').html(title[rand(0, title.length - 1)]); 
    $('.password').css('opacity', 0); 

    const cookieUser = getCookie('userData');
    if(cookieUser != null){
        loginSuccess(JSON.parse(cookieUser));
    }
})

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const reset = (what) => {
    const cls = ['.main', '.dm-div', '.result'];
    for(let i = 0; i < cls.length; i++){
        $(cls[i]).css('display', 'none');
    }
    $(what).css('display', 'flex');
}

const charToUnicode = (str) => {
    if (!str) return false;
    let unicode = '';
    for (let i = 0, l = str.length; i < l; i++) {
      unicode += '\\' + str[i].charCodeAt(0).toString(16);
    };
    return unicode;
  }

const login = () => {
    const username = $('.id').val();
    const password = $('.pw').val();

    //test

    if(username == '' || password == '') {
        Swal.fire({
            icon: 'info',
            title: '어라라?',
            text: '모든 칸이 입력되지 않았어요.'
        });
        return;
    }

    Swal.fire({
        title: '로그인 정보를 불러오고 있어요!',
        html: '알 수 없는 기기(axios)에서 로그인되었다고 알림이 갈 수 있어요!',
        didOpen: () => {
            Swal.showLoading()
        }
    })

    $.ajax({
        url: 'https://api.chicken-moo.com/zest/session',
        type: 'POST',
        data: {
            username: username,
            password: password
        },
        success: res => loginSuccess(res),
        error: e => {
            Swal.fire({
                icon: 'error',
                title: '오류 발생!',
                text: '다시 시도해 주세요.'
            });   
        }
    })
}

const loginSuccess = res => {
    if(!res.success || res.data.ds_user_id == undefined) {
        Swal.fire({
            icon: 'error',
            title: '로그인 실패!',
            text: '사용자 이름이나 비밀번호가 잘못됐습니다.'
        });
        return;
    }

    deleteCookie('userData');
    setCookie('userData', JSON.stringify(res), 99999);

    userData = res.data;
    myid = res.data.ds_user_id;
    $.ajax({
        url: 'https://api.chicken-moo.com/zest/dm/list',
        type: 'POST',
        data: {
            userData: userData,
            folder: 0,
            people_limit: 7
        },
        success: res => listSuccess(res),
        error: e => {
            Swal.fire({
                icon: 'error',
                title: '오류 발생!',
                text: '다시 시도해 주세요.'
            });   
        }
    })
}


const listSuccess = asdf => {
    console.log(asdf);
    let res = asdf.data;
    Swal.close();
    reset('.dm-div');
    $('.dm-list').empty();
    userList = res;
    for(let i = 0; i < res.length; i++){
        const e = res[i];
        users.push(e);
        let title = e.title;
        let profile_pic_url = e.user.users[0].profile_pic_url;
        let full_name = e.user.users[0].full_name;
        let username = e.user.users[0].username;
        let thread = e.thread;
        let message = e.message.text;
        let pk = e.user.users[0].pk;

        if(message == undefined) message = '인스타그램 모바일에서 확인해주세요.';

        $('.dm-list').append(`
            <div class="dm">
                <div class="dm-left-px">
                <img class="dm-pic pic${thread}" crossorigin="anonymous" src="/img/insta.jpg">
                    <div class="dm-right">
                        <div class="dm-title">${title}</div>
                        <div class="dm-content">${message}</div>
                    </div>
                </div>
                <div class="dm-right-px">
                    <div class="dm-bun button${thread} pk${pk} i${i}">분석하기</div>  
                </div>
            </div>
        `);

        $(`.button${thread}`).on('click', (e) => {
            let clss = e.target.classList;
            Swal.fire({
                title: '대화 내용을 분석 중이에요!',
                html: '1분에서 최대 5분 소요됩니다!',
                didOpen: () => {
                    Swal.showLoading()
                }
            })
            $.ajax({
                type: 'POST',
                url: 'https://api.chicken-moo.com/zest/dm/emotion',
                data: {
                    userData: userData,
                    thread: clss[1].split('button')[1]
                },
                success: res => {
                    emotionSuccess(res, clss[1].split('button')[1]);
                },
                error: e => {
                    Swal.fire({
                        icon: 'error',
                        title: '오류 발생!',
                        text: '다시 시도해 주세요.'
                    });   
                }
            })
        })

    }
    // $(`.i2`).click(); //test
}

const emotionSuccess = (res, thread) => {
    console.log(res);
    Swal.close();
    reset('.result');
    let full_name, id;
    for(let i = 0; i < users.length; i++){
        if(users[i].thread == thread){
            full_name = users[i].user.users[0].full_name;
            id = users[i].user.users[0].pk;
            break;
        }
    }
    const her = res[id];
    const min = res[myid];
    console.log(her, min);
    $('.pname').html(full_name);

    $('.haha').html(`나와 ${full_name}의 호감도`);
    $('.mth-title').html(`나 → ${full_name}`);
    $('.htm-title').html(`${full_name} → 나`);
    $('.mth-score').html(`${min.myScore}점`);
    $('.htm-score').html(`${her.myScore}점`);

    let mechat = min.text.length / (min.text.length + her.text.length) * 100;
    $('.dawe').css('width', `${mechat}%`);
    $('.ohno').css('width', `${100 - mechat}%`);
    $('.dawe').html(`나 ${Math.floor(mechat)}% (${min.text.length}번)`);
    $('.ohno').html(`${full_name} ${100 - Math.floor(mechat)}% (${her.text.length}번)`);


    let hogamher = her.positive.score / (her.positive.score + (her.negative.score * -1)) * 100;
    $('.hogam-her').css('width', `${hogamher}%`);
    $('.hogam-bu').css('width', `${100 - hogamher}%`);
    $('.hogam-her').html(`긍정 ${Math.floor(hogamher)}%`);
    $('.hogam-bu').html(`부정 ${100 - Math.floor(hogamher)}%`);
    $('.whcc').html(`${full_name}이 나에게 드는 감정`);

    if(Math.floor(hogamher) == 0){
        $('.hogam-her').css('display', 'none');
    }
    if(100 - Math.floor(hogamher) == 0){
        $('.hogam-bu').css('display', 'none');
    }
    
    let hogamme = min.positive.score / (min.positive.score + (min.negative.score * -1)) * 100;
    $('.hogam-Me').css('width', `${hogamme}%`);
    $('.hogam-mesu').css('width', `${100 - hogamme}%`);
    $('.hogam-Me').html(`긍정 ${Math.floor(hogamme)}%`);
    $('.hogam-mesu').html(`부정 ${100 - Math.floor(hogamme)}%`);
    $('.abv').html(`내가 ${full_name}에게 드는 감정`);

    if(Math.floor(hogamme) == 0){
        $('.hogam-Me').css('display', 'none');
    }
    if(100 - Math.floor(hogamme) == 0){
        $('.hogam-mesu').css('display', 'none');
    }

    let negativeMessage = min.negative.data;
    let positiveMessage = min.positive.data;
    let tmp;

    for(let i = 0; i < negativeMessage.length; i++){
        for(let j = 0; j < negativeMessage.length; j++){
            if(negativeMessage[i].score > negativeMessage[j].score){
                tmp = negativeMessage[i];
                negativeMessage[i] = negativeMessage[j];
                negativeMessage[j] = tmp;
            }
        }
    }
    console.log(negativeMessage);
    for(let i = 0; i < positiveMessage.length; i++){
        for(let j = 0; j < positiveMessage.length; j++){
            if(positiveMessage[i].score > positiveMessage[j].score){
                tmp = positiveMessage[i];
                positiveMessage[i] = positiveMessage[j];
                positiveMessage[j] = tmp;
            }
        }
    }

    let negg = 0, pogg = 0;
    for(let i = 0; i < 5; i++){
        if(negativeMessage[i] != undefined){
            $('.negg').append(`<div class="ne-message">${negativeMessage[i].data.slice(0, -1)}</div>`);
            negg++;
        }
        if(positiveMessage[i] != undefined){
            $('.pogg').append(`<div class="po-message">${positiveMessage[i].data.slice(0, -1)}</div>`);
            pogg++;
        }
    }
    if(!negg)
        ('.negg').append(`<div class="ne-message">호감도가 낮았던 말이 없어요.</div>`);
    if(!pogg)
        $('.pogg').append(`<div class="po-message">호감도가 높았던 말이 없어요.</div>`);
    console.log(positiveMessage);

}

const idend = () => {
    if($('.id').val() != ''){
        ac = 2;
        $('.pw').attr('disabled', false);
        $('.pw').focus();
        $('.idend').css('opacity', 0);
        $('.password').css('opacity', 1);
        $('.username').css('border-radius', '10px 10px 0 0');
    }
}

// $(document).ready(() => login()); //test

let ac = 0;
$(document).on('click', '.loginbtn', () => login())
$(document).on('click', '.idend', () => idend())
$(document).on('change', '.id', () => idend())
$(document).on('keyup', '.pw', () => {
    if(window.event.keyCode == 13 && $('.pw').val() != ''){
        if(ac != 2)
            login();
        ac = 0;
    }
})

$(document).on('click', '.backbutton', () => {
    location.reload();
})
$(document).on('click', '.logout', () => {
    deleteCookie('userData');
    location.reload();
})