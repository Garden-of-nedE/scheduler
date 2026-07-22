# Student Scheduler

This web app was developed as a means to migrate away from Google Sheets as my main scheduling resource.

It allows for students to personalise their own timetable, from their list of enrolled classes. As well as keep track of assessment deadlines and other events, via a notification system.

To be implemented:
- Notificaiton system
- Admin tools (editing and removing courses)
- Frontend CSS
- Logo/branding
- Input guards/checks [new course creation]

Current list:
 - Timetable weekly/daily toggle — still outstanding from a while back, if you still want it
 - Full clean-rebuild sanity check — confirming the whole project runs correctly from a cold docker compose build --no-cache && docker compose up, and that your data survives a normal restart
 - README update — reflecting the actual current data model (Course, Enrollment, UserRole, the date/deadline splits, recurring assessments) rather than the original version from early in the project
 - The deferred CSS/styling pass — logged as a scoped task, not blocking functionality
