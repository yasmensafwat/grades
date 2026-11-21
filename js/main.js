"use strict";

class Student {

    #name;
    #id;
    #grades;

    constructor(name, id, grades) {
        this.name = name;
        this.id = id;
        this.grades = grades;
    }

    set name(value) {
        if (!value || value.trim().length < 2) {
            throw new Error("اسم الطالب يجب أن يكون حرفين على الأقل");
        }

        this.#name = value.trim();
    }


    get name() {
        return this.#name;
    }


    set id(value) {
        if (!value || value.trim() === "") {
            throw new Error("رقم الطالب مطلوب");
        }

        this.#id = value.trim();
    }

  
    get id() {
        return this.#id;
    }

  
    set grades(value) {
        if (!Array.isArray(value) || value.length !== 3) {
            throw new Error("يجب إدخال ثلاث درجات");
        }

        const validGrades = value.every(
            grade =>
                typeof grade === "number" &&
                Number.isFinite(grade) &&
                grade >= 0 &&
                grade <= 100
        );

        if (!validGrades) {
            throw new Error("الدرجات يجب أن تكون بين 0 و100");
        }

        this.#grades = [...value];
    }


    get grades() {
        return [...this.#grades];
    }


    get average() {
        const total = this.#grades.reduce(
            (sum, grade) => sum + grade,
            0
        );

        return total / this.#grades.length;
    }


    get total() {
        return this.#grades.reduce(
            (sum, grade) => sum + grade,
            0
        );
    }


    get evaluation() {

        const average = this.average;

        if (average >= 85) {
            return {
                text: "ممتاز",
                className: "status-excellent"
            };
        }

        if (average >= 75) {
            return {
                text: "جيد جدًا",
                className: "status-good"
            };
        }

        if (average >= 65) {
            return {
                text: "جيد",
                className: "status-good"
            };
        }

        if (average >= 50) {
            return {
                text: "مقبول",
                className: "status-average"
            };
        }

        return {
            text: "راسب",
            className: "status-fail"
        };
    }

  
    get needsReview() {
        return this.average < 50;
    }


    getData() {
        return {
            name: this.name,
            id: this.id,
            grades: this.grades,
            total: this.total,
            average: this.average,
            evaluation: this.evaluation
        };
    }
}



const studentForm = document.getElementById("studentForm");

const studentNameInput = document.getElementById("studentName");
const studentIdInput = document.getElementById("studentId");

const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");

const studentsTableBody =
    document.getElementById("studentsTableBody");

const searchInput =
    document.getElementById("searchInput");

const totalStudentsElement =
    document.getElementById("totalStudents");

const groupAverageElement =
    document.getElementById("groupAverage");

const needsReviewElement =
    document.getElementById("needsReview");

const committeeBtn =
    document.getElementById("committeeBtn");

const committeeReport =
    document.getElementById("committeeReport");

const toastElement =
    document.getElementById("notificationToast");

const toastMessage =
    document.getElementById("toastMessage");

const notificationToast =
    new bootstrap.Toast(toastElement);


let students = [];


function showNotification(message, type = "success") {

    toastMessage.textContent = message;

    toastElement.classList.remove(
        "text-bg-success",
        "text-bg-danger",
        "text-bg-warning"
    );

    if (type === "success") {
        toastElement.classList.add("text-bg-success");
    }

    else if (type === "error") {
        toastElement.classList.add("text-bg-danger");
    }

    else {
        toastElement.classList.add("text-bg-warning");
    }

    notificationToast.show();
}


studentForm.addEventListener("submit", function (event) {

    event.preventDefault();

    try {

        const name = studentNameInput.value;
        const id = studentIdInput.value;

        const grades = [
            Number(grade1Input.value),
            Number(grade2Input.value),
            Number(grade3Input.value)
        ];


        if (
            grade1Input.value === "" ||
            grade2Input.value === "" ||
            grade3Input.value === ""
        ) {
            throw new Error("من فضلك أدخل جميع الدرجات");
        }


        const duplicateStudent = students.find(
            student => student.id === id.trim()
        );

        if (duplicateStudent) {
            throw new Error("رقم الطالب موجود بالفعل");
        }

        const newStudent = new Student(
            name,
            id,
            grades
        );


        students.push(newStudent);

        renderStudents();
        updateStatistics();


        studentForm.reset();


        committeeReport.innerHTML = "";

        showNotification(
            `تم إضافة الطالب ${newStudent.name} بنجاح`
        );

    }

    catch (error) {

        showNotification(
            error.message,
            "error"
        );

    }

});



function renderStudents(filteredStudents = students) {


    if (filteredStudents.length === 0) {

        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-secondary">
                    لا يوجد طلاب لعرضهم
                </td>
            </tr>
        `;

        return;
    }


    const studentsHTML = filteredStudents.map(student => {

        const evaluation = student.evaluation;

        return `
            <tr>

                <td>
                    <span class="student-name">
                        ${escapeHTML(student.name)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(student.id)}
                </td>

                <td>
                    ${student.grades.join(" - ")}
                </td>

                <td>
                    <span class="grade-badge">
                        ${student.average.toFixed(2)}%
                    </span>
                </td>

                <td>
                    <span class="status-badge ${evaluation.className}">
                        ${evaluation.text}
                    </span>
                </td>

                <td>
                    <button
                        class="delete-btn"
                        type="button"
                        data-id="${escapeHTML(student.id)}"
                        title="حذف الطالب"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                </td>

            </tr>
        `;

    }).join("");

    studentsTableBody.innerHTML = studentsHTML;

}


studentsTableBody.addEventListener("click", function (event) {

    const deleteButton = event.target.closest(".delete-btn");

    if (!deleteButton) {
        return;
    }

    const studentId = deleteButton.dataset.id;

    students = students.filter(
        student => student.id !== studentId
    );

    renderStudents();
    updateStatistics();


    committeeReport.innerHTML = "";

    showNotification("تم حذف الطالب بنجاح");

});


searchInput.addEventListener("input", function () {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const filteredStudents = students.filter(student => {

        const name = student.name.toLowerCase();
        const id = student.id.toLowerCase();

        return (
            name.includes(searchValue) ||
            id.includes(searchValue)
        );

    });

    renderStudents(filteredStudents);

});


function updateStatistics() {

    const total = students.length;

    totalStudentsElement.textContent = total;

    const groupAverage = students.length > 0
        ? students.reduce(
            (sum, student) => sum + student.average,
            0
        ) / students.length
        : 0;

    groupAverageElement.textContent =
        `${groupAverage.toFixed(2)}%`;


    const reviewCount = students.filter(
        student => student.needsReview
    ).length;

    needsReviewElement.textContent = reviewCount;

}


committeeBtn.addEventListener("click", function () {

    try {

        const eligibleStudents = students.filter(
            student =>
                student.average >= 45 &&
                student.average < 50
        );

        if (eligibleStudents.length === 0) {

            committeeReport.innerHTML = `
                <div class="report-result">
                    <div class="text-center py-3">
                        <i class="bi bi-info-circle fs-2 text-secondary"></i>

                        <h5 class="mt-3">
                            لا يوجد طلاب مستحقون للرأفة
                        </h5>

                        <p class="text-secondary mb-0">
                            لا يوجد طالب متوسطه بين 45 و49 حاليًا.
                        </p>
                    </div>
                </div>
            `;

            return;
        }

        const reportData = eligibleStudents.map(student => {

            const originalAverage = student.average;

            const newAverage = Math.min(
                originalAverage + 5,
                100
            );

            return {
                name: student.name,
                id: student.id,
                originalAverage: originalAverage,
                newAverage: newAverage,
                originalEvaluation: student.evaluation.text,
                newEvaluation: getEvaluation(newAverage)
            };

        });

        const totalBonus = reportData.reduce(
            (sum, student) =>
                sum + (student.newAverage - student.originalAverage),
            0
        );

        const committeeHTML = reportData.map(student => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(student.name)}
                    </td>

                    <td>
                        ${escapeHTML(student.id)}
                    </td>

                    <td>
                        ${student.originalAverage.toFixed(2)}%
                    </td>

                    <td>
                        <strong class="text-success">
                            ${student.newAverage.toFixed(2)}%
                        </strong>
                    </td>

                    <td>
                        ${student.originalEvaluation}
                    </td>

                    <td>
                        ${student.newEvaluation}
                    </td>

                </tr>
            `;

        }).join("");

        committeeReport.innerHTML = `
            <div class="report-result">

                <h5 class="mb-4">
                    <i class="bi bi-file-earmark-check me-2"></i>
                    تقرير لجنة الرأفة
                </h5>

                <div class="report-summary">

                    <div class="report-summary-item">
                        <span>عدد الطلاب المستحقين</span>
                        <strong>${reportData.length}</strong>
                    </div>

                    <div class="report-summary-item">
                        <span>إجمالي الزيادة في المتوسطات</span>
                        <strong>${totalBonus.toFixed(2)}</strong>
                    </div>

                    <div class="report-summary-item">
                        <span>الزيادة لكل طالب</span>
                        <strong>+5 درجات</strong>
                    </div>

                </div>

                <div class="table-responsive">

                    <table class="report-table">

                        <thead>
                            <tr>
                                <th>اسم الطالب</th>
                                <th>رقم الطالب</th>
                                <th>قبل الرأفة</th>
                                <th>بعد الرأفة</th>
                                <th>التقدير السابق</th>
                                <th>التقدير الجديد</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${committeeHTML}
                        </tbody>

                    </table>

                </div>

                <p class="text-secondary mt-3 mb-0 small">
                    ملاحظة: التقرير لا يغيّر درجات الطلاب الأصلية،
                    وإنما يعرض نتائج افتراضية بعد إضافة درجات الرأفة.
                </p>

            </div>
        `;

    }

    catch (error) {

        showNotification(
            error.message,
            "error"
        );

    }

});


function getEvaluation(average) {

    if (average >= 85) {
        return "ممتاز";
    }

    if (average >= 75) {
        return "جيد جدًا";
    }

    if (average >= 65) {
        return "جيد";
    }

    if (average >= 50) {
        return "مقبول";
    }

    return "راسب";

}


function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];

    });

}


updateStatistics();
renderStudents();