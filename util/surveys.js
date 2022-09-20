const surveys = [
    {
        name: "svy_themen_ru",
        start: new Date("2022-10-01"),
        end: new Date("2022-11-15"),
        pages: [
            {
                name: "p1",
                previous: null,
                next: "p2",
            },
            {
                name: "p2",
                previous: "p1",
                next: "p3",
            },
            {
                name: "p3",
                previous: "p2",
                next: "p4",
            },
            {
                name: "p4",
                previous: "p3",
                next: null,
            }
        ]
    }
]

module.exports = surveys;