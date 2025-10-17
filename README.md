# LRES Event Check-in Kiosk

## Description
A table kiosk for checking into an event. Has two selections, whether the group RSVP'd or not. Yes RSVP has them select their group. No RSVP has them provide their group size and other optional information.

## RSVP

### RSVP - Yes
* Goes to a table selection
* User selects their row
* Hits submit
* Logs into database, that user has arrived
* Logs timestamp of check-in

### RSVP - No
* Goes to a workflow
* Provide # of adults (integar)
* Provide # of kids (integar)
* Provide grade level per # of kids
* N/A for child who is not in school (Pre Pre-K, or 7 grade +)
* Email input is optional
* Logs timestamp of check-in into database

## Admin Page
* RSVP check-ins/Total RSVP's
* Total check-ins (RSVP + Walk-ins)
* Breakdown of adults vs children, by grade level
