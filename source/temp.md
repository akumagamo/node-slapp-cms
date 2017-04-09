
# Todo

- caching pages when first loaded, refresh when saved
- forms

    {
        "dataType" : "newsletter",
        "fields" : [
            { 
            "name" : "email", 
            "type" : "string", 
            "validations" : [{
                "validation" : ".+",
                "message" : "required"
            }]
            }
        ]
        }


        <srcipt src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
<style>
#message{
font-weight:bold;
color:green;
}
</style>
<h2> Newsletter registration </h2>
<label for="email">E-mail:<input id="email" /></label><br />
<div id="message" class="hidden">Erfolgreich gespeichert</div>
<button id="submit">Submit</button>

<script>

$("#submit").click(e => 
$.post("/form1", {dataType:"form1", value:{email:$("email").val()}}).done(e=>{
console.info(e);
$("#message").toggleClass("hidden");
})
);

</script>
