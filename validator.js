function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var selectorRules = {}

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule và kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break
                default:
                    errorMessage = rules[i](inputElement.value);

            }

            if (errorMessage) break;
        }

        // Nếu có lỗi thì hiển thị message lỗi
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            // Nếu không có lỗi thì xóa message lỗi
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        // Trả về kết quả: true nếu không có lỗi, false nếu có lỗi
        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true; // Biến kiểm tra tổng thể form

            // Lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule); // Kiểm tra từng input
                if (!isValid) {
                    isFormValid = false; // Nếu có lỗi, đặt isFormValid là false
                }
            });

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                       switch(input.type){
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value
                            break;  
                        case 'checkbox':
                            if(!input.matches(':checked')){
                                values[input.name] = ''
                                return values;
                            }
                            if(!Array.isArray(values[input.name])){
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break
                        case 'file':
                            values[input.name] = input.files
                            break
                           
                        default:
                            values[input.name] = input.value
                       }
                        return values
                        
                    }, {}

                    );
                    options.onSubmit(formValues);
                }

            }
        }

        // Lặp qua mỗi rule và xử lí sự kiện (blur, input)
        options.rules.forEach(function (rule) {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    // Xử lý trường hợp blur khỏi input
                    inputElement.onblur = function () {
                        validate(inputElement, rule);
                    }

                    // Xử lý mỗi khi người dùng nhập vào input
                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                }
            });

        });
    }
}

// Các rule validator
Validator.isRequest = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email';
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập ít nhất ${min} kí tự`;
        }
    };
}

Validator.isConfirmPass = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    };
}
