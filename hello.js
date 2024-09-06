function validator(options) {
    // initialize the important containers
    var selectorRules = {}
    var radioList = []
    var inputValue = []

    // find the HTML element that matches the container's css selector in the case of the input has many parents
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    
    // take the error message into view
    function invalidIntoView() {
        // use intersectionObserver
        // const observer = new IntersectionObserver((entries) => {
        //     entries.forEach((entry) => {
        //         if (0 <= entry.intersectionRatio >= 1) {
        //             setTimeout(function() {
        //                 entry.target.scrollIntoView(
        //                     {
        //                         behavior: 'smooth',
        //                         block: 'end',
        //                     }
        //                 )
        //                 console.log('intersection is running');
        //             }, 300)
        //         }
        //     })
        // })

        // invalidInputs = formElement.querySelectorAll('.invalid')

        // invalidInputs.forEach(function(invalidInput) {
        //     observer.observe(invalidInput)
        // });

        // Do not check if the input element is in the viewport or not
        // if (invalidInputs.length === 1) {
        //     setTimeout(function() {
        //         invalidInputs[0].scrollIntoView(
        //             {
        //                 behavior: 'smooth',
        //                 block: 'end',
        //             }
        //         )
        //         // console.log(invalidInputs[0]);
        //     }, 300)
        // }
        
        // user getBoundingClientRect
        var allInvalidOutOfViewport = true
        invalidInputs = formElement.querySelectorAll('.invalid')
        invalidInputs.forEach(function(invalidInput) {
            if (invalidInput.getBoundingClientRect().top > 0) {
                allInvalidOutOfViewport = false
            }
        })
        if (allInvalidOutOfViewport) {
            invalidInputs.forEach(function(invalidInput) {
                setTimeout(function() {
                    invalidInput.scrollIntoView(
                        {
                            behavior: 'smooth',
                            block: 'end',
                        }
                        )
                }, 300)
            });
        }
    }


    // detect and throw an error when the user leave the input blank
    function validate(inputElement, rule) {
        const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage
        const rules = selectorRules[rule.selector]
        // retrieve the rules of the selected element, identify the violated rule, and activated that rule
        for (i = 0; i < rules.length; i++) {
            // call function test()
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                break
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            // if (inputElement.type === 'radio') {
            //     var radioChecked = false
            //     radioList.forEach(function(radio){
            //         if (radio.checked) {
            //             radioChecked = true
            //         }
            //     })
            //     errorMessage = rules[i](radioChecked)
            // } else {
            //     errorMessage = rules[i](inputElement.value)
            // }
            if (errorMessage) break
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        return errorMessage
    }
    
    // show and hide the password after the user clicks on eye icon
    function handlePassword(showHideElement, rule) {
        const showHideBtn = getParent(showHideElement, options.formGroupSelector).querySelector(options.showHide)
        const isHide = rule.test(showHideElement.type)
        if (isHide) {
            showHideElement.type = 'text'
            showHideBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>'
        } else {
            showHideElement.type = 'password'
            showHideBtn.innerHTML = '<i class="fa-regular fa-eye"></i>'
        }
    }

    // remove the error message from the confirmation input when the user rewrites the password to match the confirmation password
    function update(updateElement, rule) {
        var errorMessage = rule.test(updateElement.value)
        const confirmElement = document.querySelector(rule.confirmSelector)
        if (confirmElement && !errorMessage) {
            confirmElement.parentElement.classList.remove('invalid')
        }
    }

    const formElement = document.querySelector(options.form)

    // handle the focus and blur events of the input and require the user to not leave the input blank
    if (formElement) {
        
        // activate all the rules when the user clicks on the submit button
        formElement.onsubmit = (e) => {
            e.preventDefault()
            var isFormValid = true
            options.rules.forEach(function(rule) {
                const inputElement = document.querySelector(rule.selector)
                var isError = validate(inputElement, rule)
                if (isError) {
                    isFormValid = false
                }
            })

            invalidIntoView()
            
            if (isFormValid) {
                // case submit by using javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'radio':
                                if (input.checked) {
                                    values[input.name] = input.value
                                }
                                if (!values[input.name]) {
                                    values[input.name] = ''
                                }
                                // values[input.name] = formElement.querySelector('[name="' + input.name + '"]:checked') ? formElement.querySelector('[name="' + input.name + '"]:checked').value : '';
                                break
                            case 'checkbox':
                                // lỗi xảy ra khi ta chỉ check vào những box phía trên còn phía dưới thì ko
                                // khi duyệt đến những box ở phía dưới ko đk check thì mảng chứa value
                                // của các box đã chọn sẽ bị ghi đè lại bằng một mảng rỗng []
                                // if (!input.checked) {
                                //     values[input.name] = ''
                                //     return values
                                // }
                                // if (input.checked) {
                                //     inputValue.push(input.value)
                                //     values[input.name] = inputValue
                                // }
                                // if (inputValue.length === 1) {
                                //     values[input.name] = inputValue.join('')
                                // }
                                // if (!Array.isArray(values[input.name])) {
                                //     values[input.name] = []
                                // }
                                // if (input.checked) {
                                //     values[input.name].push(input.value)
                                // }
                                if (input.checked) {
                                    if (Array.isArray(values[input.name])) {
                                        values[input.name].push(input.value)
                                    } else {
                                        values[input.name] = [input.value]
                                    }
                                }
                                // if (values[input.name].length === 0) {
                                //     values[input.name] = ''
                                // }
                                if (!values[input.name]) {
                                    values[input.name] = ''
                                }
                                // values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues)
                    alert('you has just signed up successfully')
                } 
                // case submit with default event
                else {
                    formElement.submit()
                }
            } 
        }

        // iterate through each rule and handle (listen event)
        options.rules.forEach(function(rule) {

            // save the rules for each input element
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            var inputElements = formElement.querySelectorAll(rule.selector)
            
            if (inputElements) {
                inputElements.forEach(function(inputElement) {
                    inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }
                    inputElement.onchange = function() {
                        validate(inputElement, rule)
                    }
                    inputElement.onfocus = function () {
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }
                })
                // if (inputElement.type === 'radio') {
                //     radioList.push(inputElement)
                // }
                // handle the blur event to require the user follows the rules
                // inputElement.onblur = function() {
                    // console.log(e.target)
                    // var conditions = e.target !== showPassword
                    // console.log(conditions)
                    // if (conditions) {
                    //     validate(inputElement, rule)
                    // }
                //     validate(inputElement, rule)
                // }

                // handle the focus event when the user clicks on the input
                
                // remove error messages when the user clicks on the input or inputs data
                // inputElement.oninput = function () {
                //     getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                //     console.log(inputElement.value === options.getConfirm());
                // }

                // show and hide the password when the user clicks on eye icon
                // const showPassword = getParent(inputElement, options.formGroupSelector).querySelector(options.showPassword)
                // if (showPassword) {
                //     showPassword.onclick = function () {
                //         handlePassword(inputElement, rule)
                //     }
                // }
            }
        })
        options.showHideRules.forEach(function(showHideRule) {
            const showHideElement = document.querySelector(showHideRule.selector)
            const showHideBtn = getParent(showHideElement, options.formGroupSelector).querySelector(options.showHide)
            if (showHideElement) {
                showHideBtn.onclick = function() {
                    handlePassword(showHideElement, showHideRule)
                }
            }
        })

        options.updateRules.forEach(function(updateRule) {
            const updateElement = document.querySelector(updateRule.selector)
            if (updateElement) {
                updateElement.oninput = function() {
                    update(updateElement, updateRule)
                }
            }
        })
    }
}

// require user to not leave the input blank
validator.isRequired = function(selector, message) {
    return {
        selector,
        test(value) {
            var result = typeof value === 'string' ? value.trim() : value;
            return result ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}

// require user to input enough letters for this field
validator.isMinLength = function(selector, num, message) {
    return {
        selector,
        test(value) {
            return value.length >= num ? undefined : message || `Vui lòng nhập tối thiểu ${num} ký tự!`
        }
    }
}

// require the user to provide a valid email format
validator.isEmail = function(selector, message) {
    return {
        selector,
        test(value) {
            const emailPattern = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'g')
            return emailPattern.test(value) ? undefined : message || 'Vui lòng nhập chính xác email!'
        }
    }
}

// confirm the password
validator.isConfirmed = function(selector, getConfirmValue, message, confirmSelector) {
    return {
        selector,
        confirmSelector,
        test(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!'
        }
    }
}

// show and hide the password
validator.showHide = function(selector, message) {
    return {
        selector,
        test(type) {
            return type === 'password'
        }
    }
}

// show and hide the password after the user clicks on eye icon
// this function is no longer used
showPassword = function(selector) {
    const passwordElement = document.querySelector(selector)
    const showPassword = passwordElement.parentElement.querySelector('.show-password')
    showPassword.onclick = function() {
        if (passwordElement.type === 'password') {
            passwordElement.type = 'text'
            showPassword.innerHTML = '<i class="fa-regular fa-eye-slash"></i>'
        } else {
            passwordElement.type = 'password'
            showPassword.innerHTML = '<i class="fa-regular fa-eye"></i>'
        }
    }
}
