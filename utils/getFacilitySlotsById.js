const fs = require("fs").promises;
const path = require("path");

async function getFacilitySlotsUtils(req, res) {
  try {
    const facilityId = req.params.id;

    const templateData = await fs.readFile(path.join('utils', 'timeslot-template.json'), 'utf8');
    const templates = JSON.parse(templateData);

    if (!templates.length) {
      return res.status(500).json({ message: "No slot templates found" });
    }

    const template = templates[0];

    const interval = template.interval_minutes;
    const [startHour, startMinute] = template.start_time.split(":").map(Number);
    const [endHour, endMinute] = template.end_time.split(":").map(Number);

    const weeklySlots = [];
    const today = new Date();

    template.days.forEach((day, index) => {
    const currentDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Singapore" }));
    currentDate.setDate(today.getDate() + index); 

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        weeklySlots.push({
        facilityId,
        day,
        date: currentDate.toISOString().split('T')[0], 
        time: slotStart
        });

        currentMinute += interval;
        if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
        }
    }
    });

    const bookingsData = await fs.readFile(path.join('utils', 'bookings.json'), 'utf8').catch(() => "[]");
    const bookings = JSON.parse(bookingsData);

    const availableSlots = weeklySlots.filter(slot => {
        return !bookings.some(b =>
            String(b.facilityId) === String(facilityId) &&
            b.bookingDate === slot.date &&
            b.bookingTime === slot.time
        );
    });


    return res.status(200).json({
      availableSlots
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getFacilitySlotsUtils };
