$(document).ready(function () {

    // Load previous records on page load
    loadRecords();

    // Add a new course row
    $('#addCourse').click(function () {
        var row = $('.course-row').first().clone();
        row.find('input').val('');
        row.append(
            '<div class="col-auto">' +
            '<button type="button" class="btn btn-danger remove-row">X</button>' +
            '</div>'
        );
        $('#courses').append(row);
    });

    // Remove a course row
    $(document).on('click', '.remove-row', function () {
        if ($('.course-row').length > 1) {
            $(this).closest('.course-row').remove();
        }
    });

    // Submit via AJAX
    $('#gpaForm').submit(function (e) {
        e.preventDefault();

        var studentName = $('#studentName').val().trim();
        var semester = $('#semester').val().trim();

        if (studentName === '' || semester === '') {
            alert('Please enter student name and semester!');
            return;
        }

        var valid = true;
        $('[name="course[]"]').each(function () {
            if ($(this).val().trim() === '') valid = false;
        });
        $('[name="credits[]"]').each(function () {
            if (isNaN($(this).val()) || parseFloat($(this).val()) <= 0) valid = false;
        });
        if (!valid) {
            $('#result').html('<div class="alert alert-warning">Please enter valid values in all fields.</div>');
            return;
        }

        var formData = $(this).serialize();
        formData += '&studentName=' + encodeURIComponent(studentName);
        formData += '&semester=' + encodeURIComponent(semester);

        $.ajax({
            url: 'calculate.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    var alertClass = 'alert-info';
                    var barColor = 'bg-primary';
                    if (response.gpa >= 3.7) {
                        alertClass = 'alert-success';
                        barColor = 'bg-success';
                    } else if (response.gpa >= 3.0) {
                        alertClass = 'alert-info';
                        barColor = 'bg-primary';
                    } else if (response.gpa >= 2.0) {
                        alertClass = 'alert-warning';
                        barColor = 'bg-warning';
                    } else {
                        alertClass = 'alert-danger';
                        barColor = 'bg-danger';
                    }

                    $('#result').html(
                        '<div class="alert ' + alertClass + '">' +
                        response.message + '</div>' +
                        response.tableHtml
                    );

                    // Progress Bar
                    var percent = (response.gpa / 4) * 100;
                    $('#progressSection').show();
                    $('#progressBar')
                        .css('width', percent + '%')
                        .attr('aria-valuenow', response.gpa)
                        .text('GPA: ' + response.gpa.toFixed(2))
                        .removeClass('bg-success bg-primary bg-warning bg-danger')
                        .addClass(barColor);

                    // Show CSV button
                    $('#exportCSV').show();

                    // Reload previous records
                    loadRecords();

                } else {
                    $('#result').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function () {
                $('#result').html('<div class="alert alert-danger">Server error occurred.</div>');
            }
        });
    });

    // Export CSV
    $('#exportCSV').click(function () {
        var studentName = $('#studentName').val().trim();
        var semester = $('#semester').val().trim();
        window.location.href = 'export.php?studentName=' +
            encodeURIComponent(studentName) + '&semester=' +
            encodeURIComponent(semester);
    });

    // Load previous records function
    function loadRecords() {
        $.ajax({
            url: 'records.php',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.length === 0) {
                    $('#previousRecords').html('<p class="text-muted">No records yet.</p>');
                    return;
                }
                var html = '<div class="row">';
                $.each(data, function (i, rec) {
                    var badgeClass = 'badge-danger';
                    if (rec.gpa >= 3.7) badgeClass = 'badge-success';
                    else if (rec.gpa >= 3.0) badgeClass = 'badge-primary';
                    else if (rec.gpa >= 2.0) badgeClass = 'badge-warning';

                    html += '<div class="col-md-4 mb-3">' +
                        '<div class="card">' +
                        '<div class="card-body">' +
                        '<h6 class="card-title">' + rec.student_name + '</h6>' +
                        '<p class="card-text">Semester: ' + rec.semester + '</p>' +
                        '<span class="badge ' + badgeClass + '">GPA: ' + parseFloat(rec.gpa).toFixed(2) + '</span>' +
                        '<br><small class="text-muted">' + rec.created_at + '</small>' +
                        '</div></div></div>';
                });
                html += '</div>';
                $('#previousRecords').html(html);
            }
        });
    }
});
