function adjustCodeBlockHeight() {
    const formWrapper = document.querySelector('.form-wrapper');
    const codeWrapper = document.querySelector('.code-wrapper');
    const formWrapperHeight = formWrapper.offsetHeight;
    const newHeight = formWrapperHeight - (4 * 16); // Convert rem to pixels
    codeWrapper.style.height = `${newHeight}px`;
}

function addCategoryInput(removeButtonEnabled = true) {
    const categoryContainer = document.getElementById('categoryContainer');
    const currentCategoryCount = categoryContainer.getElementsByClassName('category-input-wrapper').length;

    if (currentCategoryCount >= 12) {
        alert('You can add a maximum of 12 categories.');
        return;
    }

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'category-input-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'categories';
    input.className = 'category-input';
    input.placeholder = 'Enter category';

    inputWrapper.appendChild(input);

    if (removeButtonEnabled) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-button';
        removeButton.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
        </svg>`;
        removeButton.onclick = () => {
            if (categoryContainer.getElementsByClassName('category-input-wrapper').length > 1) {
                categoryContainer.removeChild(inputWrapper);
                adjustCodeBlockHeight();
            } else {
                alert('At least one category is required.');
            }
        };
        inputWrapper.appendChild(removeButton);
    }

    categoryContainer.appendChild(inputWrapper);
    adjustCodeBlockHeight();
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function isValidDate(dateString) {
    const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
    return datePattern.test(dateString);
}

function generateScript() {
    const categoryInputs = document.getElementsByClassName('category-input');
    const categories = Array.from(categoryInputs).map(input => input.value).filter(value => value.trim() !== '');
    const calendarId = document.getElementById('calendarId').value;
    const spreadsheetId = document.getElementById('spreadsheetId').value;
    const startDate = document.getElementById('startDate').value;

    if (!isValidEmail(calendarId)) {
        alert('Please enter a valid email address.');
        return;
    }

    if (!isValidDate(startDate.replace(/-/g, '/'))) {
        alert('Please enter a valid date in the format YYYY/MM/DD.');
        return;
    }

    const generateButton = document.querySelector('.button-main');
    generateButton.textContent = 'Generating...';
    generateButton.classList.add('generating');
    generateButton.style.backgroundColor = 'green';

    setTimeout(() => {
        let script = `
function categorizeTasks() {
    var calendarId = '${calendarId}';
    var spreadsheetId = '${spreadsheetId}';
    var startDate = new Date('${startDate}');
    var endDate = new Date();
    var events = CalendarApp.getCalendarById(calendarId).getEvents(startDate, endDate);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var categorizedTasksByDate = {};

    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var taskName = event.getTitle();
        var category = categorizeEvent(taskName);
        var duration = calculateEventDuration(event);
        var eventDate = event.getStartTime().toDateString();

        if (!categorizedTasksByDate[eventDate]) {
            categorizedTasksByDate[eventDate] = {`;

                categories.forEach(category => {
                    script += `\n                '${category.trim()}': 0,`;
                });

                script += `
            };
        }

        categorizedTasksByDate[eventDate][category] += duration;
    }

    var sheet = spreadsheet.getSheetByName('summarySheet');
    var headers = ['Date',`;

                categories.forEach(category => {
                    script += ` '${category.trim()}',`;
                });

                script += `];
    sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    var row = 2;
    for (var date in categorizedTasksByDate) {
        var taskValues = [date];
        for (var headerIndex = 1; headerIndex < headers.length; headerIndex++) {
            var category = headers[headerIndex];
            taskValues.push(categorizedTasksByDate[date][category] || 0);
        }
        sheet.getRange(row, 1, 1, taskValues.length).setValues([taskValues]);
        row++;
    }
}

function calculateEventDuration(event) {
    var startTime = event.getStartTime();
    var endTime = event.getEndTime();
    var durationMilliseconds = endTime - startTime;
    var durationHours = durationMilliseconds / (1000 * 60 * 60);
    return durationHours;
}

function categorizeEvent(eventName) {`;

                categories.forEach((category) => {
                    script += `
    if (eventName.includes("${category.trim()}")) return "${category.trim()}";`;
                });

                script += `
}
`;

        const outputElement = document.getElementById('output');
        outputElement.textContent = script;
        Prism.highlightElement(outputElement);
        adjustCodeBlockHeight();

        generateButton.textContent = 'Update Script';
        generateButton.classList.remove('generating');
        generateButton.style.backgroundColor = 'var(--orange)';
        document.querySelector('.copy-button').classList.remove('disabled');
        document.querySelector('.copy-button').disabled = false;
    }, 1000);
}

function copyToClipboard() {
    const outputElement = document.getElementById('output');
    const textarea = document.createElement('textarea');
    textarea.value = outputElement.textContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    const copyButton = document.querySelector('.copy-button');
    copyButton.textContent = '✓ Copied';
    copyButton.style.backgroundColor = 'green';

    setTimeout(() => {
        copyButton.textContent = 'Copy Code';
        copyButton.style.backgroundColor = 'var(--orange)';
    }, 1500);
}

function resetForm() {
    document.querySelector('form').reset();
    document.getElementById('categoryContainer').innerHTML = '';
    addCategoryInput(false);
    addCategoryInput();
    const generateButton = document.querySelector('.button-main');
    generateButton.textContent = 'Generate Script';
    const outputElement = document.getElementById('output');
    outputElement.textContent = '';
    adjustCodeBlockHeight();
    document.querySelector('.copy-button').classList.add('disabled');
    document.querySelector('.copy-button').disabled = true;
}

window.onload = function() {
    addCategoryInput(false); // First category input without remove button
    addCategoryInput(); // Second category input with remove button
    adjustCodeBlockHeight();
};